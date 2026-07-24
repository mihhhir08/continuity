use anyhow::{Context, Result, bail};
use base64::{Engine, engine::general_purpose::STANDARD};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};
use walkdir::WalkDir;

const STATE: &str = ".continuity";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChangeSet {
    pub id: String,
    pub from: String,
    pub to: String,
    #[serde(default)]
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub path: String,
    pub line: usize,
    pub matched: String,
    pub replacement: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Simulation {
    pub change_id: String,
    pub project_hash: String,
    pub findings: Vec<Finding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Check {
    pub command: String,
    pub success: bool,
    pub code: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attestation {
    pub predicate_type: String,
    pub change_id: String,
    pub project_hash: String,
    pub patch_hash: String,
    pub created_at_unix: u64,
    pub checks: Vec<Check>,
    pub verified: bool,
    pub public_key: String,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationCapsule {
    pub format: String,
    pub issuer: String,
    pub artifact: String,
    pub change: ChangeSet,
    pub expires_at_unix: u64,
    pub public_key: String,
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    verify: Vec<String>,
    #[serde(default)]
    trusted_capsule_issuers: Vec<String>,
}

pub fn init(root: &Path) -> Result<()> {
    let state = root.join(STATE);
    fs::create_dir_all(&state)?;
    let config = state.join("config.json");
    if !config.exists() {
        fs::write(
            config,
            serde_json::to_vec_pretty(&Config {
                verify: vec!["cargo test --workspace".into()],
                trusted_capsule_issuers: Vec::new(),
            })?,
        )?;
    }
    let key = state.join("signing.key");
    if !key.exists() {
        let encoded = STANDARD.encode(SigningKey::generate(&mut OsRng).to_bytes());
        #[cfg(unix)]
        {
            use std::io::Write;
            use std::os::unix::fs::OpenOptionsExt;
            let mut file = fs::OpenOptions::new()
                .write(true)
                .create_new(true)
                .mode(0o600)
                .open(&key)?;
            file.write_all(encoded.as_bytes())?;
        }
        #[cfg(not(unix))]
        fs::write(&key, encoded)?;
    }
    Ok(())
}

pub fn load_change(path: &Path) -> Result<ChangeSet> {
    serde_json::from_slice(&fs::read(path).with_context(|| format!("read {}", path.display()))?)
        .context("parse change set")
}

fn source_files(root: &Path) -> impl Iterator<Item = PathBuf> + '_ {
    WalkDir::new(root)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|entry| {
            let path = entry.path();
            entry.file_type().is_file()
                && matches!(
                    path.extension().and_then(|x| x.to_str()),
                    Some("ts" | "tsx" | "js" | "py")
                )
                && !path.components().any(|x| {
                    matches!(
                        x.as_os_str().to_str(),
                        Some(".git" | ".continuity" | "node_modules" | "target" | "dist")
                    )
                })
        })
        .map(|entry| entry.into_path())
}

pub fn project_hash(root: &Path) -> Result<String> {
    let mut files: Vec<_> = source_files(root).collect();
    files.sort();
    let mut digest = Sha256::new();
    for path in files {
        digest.update(path.strip_prefix(root)?.to_string_lossy().as_bytes());
        digest.update(fs::read(path)?);
    }
    Ok(format!("{:x}", digest.finalize()))
}

pub fn scan(root: &Path) -> Result<serde_json::Value> {
    let files: Vec<_> = source_files(root)
        .map(|p| p.strip_prefix(root).unwrap().to_string_lossy().into_owned())
        .collect();
    Ok(serde_json::json!({
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "metadata": {"component": {"type": "application", "name": root.file_name().and_then(|x| x.to_str()).unwrap_or("project")}},
        "properties": [{"name": "continuity:project_hash", "value": project_hash(root)?}],
        "components": files.into_iter().map(|name| serde_json::json!({"type":"file","name":name})).collect::<Vec<_>>()
    }))
}

pub fn simulate(root: &Path, change: &ChangeSet) -> Result<Simulation> {
    let mut findings = Vec::new();
    for path in source_files(root) {
        let content = fs::read_to_string(&path)?;
        for (index, line) in content.lines().enumerate() {
            if line.contains(&change.from) {
                findings.push(Finding {
                    path: path.strip_prefix(root)?.to_string_lossy().into_owned(),
                    line: index + 1,
                    matched: change.from.clone(),
                    replacement: change.to.clone(),
                    status: "repairable".into(),
                });
            }
        }
    }
    Ok(Simulation {
        change_id: change.id.clone(),
        project_hash: project_hash(root)?,
        findings,
    })
}

pub fn repair(root: &Path, change: &ChangeSet, apply: bool, approved: bool) -> Result<Simulation> {
    let simulation = simulate(root, change)?;
    if apply && !approved {
        bail!("write denied: pass --approve after reviewing the dry run");
    }
    if apply {
        for finding in &simulation.findings {
            let path = root.join(&finding.path);
            let before = fs::read_to_string(&path)?;
            fs::write(path, before.replace(&change.from, &change.to))?;
        }
    }
    Ok(simulation)
}

pub fn verify(root: &Path) -> Result<Vec<Check>> {
    let config: Config = serde_json::from_slice(
        &fs::read(root.join(STATE).join("config.json")).context("run continuity init first")?,
    )?;
    let mut checks = Vec::new();
    for command in config.verify {
        let status = Command::new("sh")
            .arg("-c")
            .arg(&command)
            .current_dir(root)
            .status()?;
        checks.push(Check {
            command,
            success: status.success(),
            code: status.code(),
        });
    }
    Ok(checks)
}

pub fn attest(root: &Path, change: &ChangeSet, checks: Vec<Check>) -> Result<Attestation> {
    init(root)?;
    let verified = !checks.is_empty() && checks.iter().all(|x| x.success);
    if !verified {
        bail!("verification failed; successful evidence was not generated");
    }
    let project_hash = project_hash(root)?;
    let patch_hash = format!(
        "{:x}",
        Sha256::digest(format!("{}:{}:{}", change.id, change.from, change.to))
    );
    let created_at_unix = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
    let signing = signing_key(root)?;
    let mut evidence = Attestation {
        predicate_type: "https://continuity.dev/attestation/v1".into(),
        change_id: change.id.clone(),
        project_hash,
        patch_hash,
        created_at_unix,
        checks,
        verified,
        public_key: STANDARD.encode(signing.verifying_key().to_bytes()),
        signature: String::new(),
    };
    evidence.signature = STANDARD.encode(signing.sign(&attestation_payload(&evidence)?).to_bytes());
    Ok(evidence)
}

pub fn migrate(root: &Path, change: &ChangeSet) -> Result<(Simulation, Vec<Check>, Attestation)> {
    let preview = simulate(root, change)?;
    let mut snapshots = BTreeMap::new();
    for finding in &preview.findings {
        snapshots
            .entry(finding.path.clone())
            .or_insert(fs::read(root.join(&finding.path))?);
    }
    let result = (|| {
        let repaired = repair(root, change, true, true)?;
        let checks = verify(root)?;
        let evidence = attest(root, change, checks.clone())?;
        Ok((repaired, checks, evidence))
    })();
    if result.is_err() {
        for (path, bytes) in snapshots {
            fs::write(root.join(path), bytes)?;
        }
    }
    result
}

pub fn verify_attestation(attestation: &Attestation) -> Result<()> {
    let key = VerifyingKey::from_bytes(
        &STANDARD
            .decode(&attestation.public_key)?
            .try_into()
            .map_err(|_| anyhow::anyhow!("invalid public key"))?,
    )?;
    let signature = Signature::from_bytes(
        &STANDARD
            .decode(&attestation.signature)?
            .try_into()
            .map_err(|_| anyhow::anyhow!("invalid signature"))?,
    );
    if !attestation.verified
        || attestation.checks.is_empty()
        || attestation.checks.iter().any(|check| !check.success)
    {
        bail!("attestation does not contain successful verification");
    }
    key.verify(&attestation_payload(attestation)?, &signature)
        .context("signature verification")
}

fn signing_key(root: &Path) -> Result<SigningKey> {
    init(root)?;
    let key_bytes =
        STANDARD.decode(fs::read_to_string(root.join(STATE).join("signing.key"))?.trim())?;
    Ok(SigningKey::from_bytes(
        &key_bytes
            .try_into()
            .map_err(|_| anyhow::anyhow!("invalid signing key"))?,
    ))
}

fn attestation_payload(attestation: &Attestation) -> Result<Vec<u8>> {
    Ok(serde_json::to_vec(&(
        &attestation.predicate_type,
        &attestation.change_id,
        &attestation.project_hash,
        &attestation.patch_hash,
        attestation.created_at_unix,
        &attestation.checks,
        attestation.verified,
    ))?)
}

fn capsule_payload(capsule: &MigrationCapsule) -> Result<Vec<u8>> {
    Ok(serde_json::to_vec(&(
        &capsule.format,
        &capsule.issuer,
        &capsule.artifact,
        &capsule.change,
        capsule.expires_at_unix,
    ))?)
}

pub fn create_capsule(
    root: &Path,
    issuer: String,
    artifact: String,
    change: ChangeSet,
    expires_at_unix: u64,
) -> Result<MigrationCapsule> {
    if issuer.trim().is_empty() || artifact.trim().is_empty() {
        bail!("capsule issuer and artifact are required");
    }
    let signing = signing_key(root)?;
    let mut capsule = MigrationCapsule {
        format: "https://continuity.dev/migration-capsule/v1".into(),
        issuer,
        artifact,
        change,
        expires_at_unix,
        public_key: STANDARD.encode(signing.verifying_key().to_bytes()),
        signature: String::new(),
    };
    capsule.signature = STANDARD.encode(signing.sign(&capsule_payload(&capsule)?).to_bytes());
    Ok(capsule)
}

pub fn verify_capsule(capsule: &MigrationCapsule) -> Result<()> {
    let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
    if capsule.format != "https://continuity.dev/migration-capsule/v1"
        || capsule.expires_at_unix <= now
    {
        bail!("capsule is invalid or expired");
    }
    let key = VerifyingKey::from_bytes(
        &STANDARD
            .decode(&capsule.public_key)?
            .try_into()
            .map_err(|_| anyhow::anyhow!("invalid capsule public key"))?,
    )?;
    let signature = Signature::from_bytes(
        &STANDARD
            .decode(&capsule.signature)?
            .try_into()
            .map_err(|_| anyhow::anyhow!("invalid capsule signature"))?,
    );
    key.verify(&capsule_payload(capsule)?, &signature)
        .context("capsule signature verification")
}

pub fn capsule_issuer_trusted(root: &Path, issuer: &str) -> Result<bool> {
    let config: Config = serde_json::from_slice(
        &fs::read(root.join(STATE).join("config.json")).context("run continuity init first")?,
    )?;
    Ok(config
        .trusted_capsule_issuers
        .iter()
        .any(|trusted| trusted == issuer))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn simulates_repairs_and_signs() -> Result<()> {
        let dir = tempfile::tempdir()?;
        fs::write(dir.path().join("client.ts"), "fetch('/v1/jobs')")?;
        init(dir.path())?;
        fs::write(
            dir.path().join(STATE).join("config.json"),
            r#"{"verify":["test -f client.ts"]}"#,
        )?;
        let change = ChangeSet {
            id: "openapi-v2".into(),
            from: "/v1/jobs".into(),
            to: "/v2/runs".into(),
            description: String::new(),
        };
        assert_eq!(simulate(dir.path(), &change)?.findings.len(), 1);
        repair(dir.path(), &change, true, true)?;
        let evidence = attest(dir.path(), &change, verify(dir.path())?)?;
        verify_attestation(&evidence)?;
        let mut tampered = evidence.clone();
        tampered.checks[0].command = "untrusted replacement".into();
        assert!(verify_attestation(&tampered).is_err());
        let capsule = create_capsule(
            dir.path(),
            "provider.example".into(),
            "api.example/openapi".into(),
            change.clone(),
            SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 3600,
        )?;
        verify_capsule(&capsule)?;
        let mut tampered_capsule = capsule.clone();
        tampered_capsule.change.to = "/attacker".into();
        assert!(verify_capsule(&tampered_capsule).is_err());
        assert!(fs::read_to_string(dir.path().join("client.ts"))?.contains("/v2/runs"));
        Ok(())
    }

    #[test]
    fn failed_verification_rolls_back_migration() -> Result<()> {
        let dir = tempfile::tempdir()?;
        fs::write(dir.path().join("client.ts"), "fetch('/v1/jobs')")?;
        init(dir.path())?;
        fs::write(
            dir.path().join(STATE).join("config.json"),
            r#"{"verify":["false"]}"#,
        )?;
        let change = ChangeSet {
            id: "rollback".into(),
            from: "/v1/jobs".into(),
            to: "/v2/runs".into(),
            description: String::new(),
        };
        assert!(migrate(dir.path(), &change).is_err());
        assert!(fs::read_to_string(dir.path().join("client.ts"))?.contains("/v1/jobs"));
        Ok(())
    }
}
