use anyhow::{Context, Result, bail};
use base64::{Engine, engine::general_purpose::STANDARD};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
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

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    verify: Vec<String>,
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
            })?,
        )?;
    }
    let key = state.join("signing.key");
    if !key.exists() {
        fs::write(
            key,
            STANDARD.encode(SigningKey::generate(&mut OsRng).to_bytes()),
        )?;
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
    let key_bytes =
        STANDARD.decode(fs::read_to_string(root.join(STATE).join("signing.key"))?.trim())?;
    let signing = SigningKey::from_bytes(
        &key_bytes
            .try_into()
            .map_err(|_| anyhow::anyhow!("invalid signing key"))?,
    );
    let payload = format!(
        "{}:{}:{}:{}",
        change.id, project_hash, patch_hash, created_at_unix
    );
    let signature = signing.sign(payload.as_bytes());
    Ok(Attestation {
        predicate_type: "https://continuity.dev/attestation/v1".into(),
        change_id: change.id.clone(),
        project_hash,
        patch_hash,
        created_at_unix,
        checks,
        verified,
        public_key: STANDARD.encode(signing.verifying_key().to_bytes()),
        signature: STANDARD.encode(signature.to_bytes()),
    })
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
    let payload = format!(
        "{}:{}:{}:{}",
        attestation.change_id,
        attestation.project_hash,
        attestation.patch_hash,
        attestation.created_at_unix
    );
    key.verify(payload.as_bytes(), &signature)
        .context("signature verification")
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
        assert!(fs::read_to_string(dir.path().join("client.ts"))?.contains("/v2/runs"));
        Ok(())
    }
}
