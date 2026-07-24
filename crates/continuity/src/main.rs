mod mcp;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use continuity::{
    Attestation, ChangeSet, MigrationCapsule, Simulation, attest, capsule_issuer_trusted,
    create_capsule, init, load_change, migrate, repair, scan, simulate, verify, verify_attestation,
    verify_capsule,
};
use serde_json::{Value, json};
use std::{
    env, fs,
    path::PathBuf,
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

#[derive(Parser)]
#[command(name = "continuity", about = "Software that survives change")]
struct Cli {
    #[arg(long, default_value = ".")]
    root: PathBuf,
    #[arg(long, global = true)]
    json: bool,
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Init,
    Scan,
    Simulate {
        #[arg(long)]
        change: PathBuf,
    },
    Repair {
        #[arg(long)]
        change: PathBuf,
        #[arg(long)]
        apply: bool,
        #[arg(long)]
        approve: bool,
    },
    Verify,
    Export {
        #[arg(long)]
        change: PathBuf,
        #[arg(long, default_value = ".continuity/attestation.json")]
        output: PathBuf,
    },
    AttestationVerify {
        path: PathBuf,
    },
    Capsule {
        #[command(subcommand)]
        command: CapsuleCommand,
    },
    Mcp {
        #[command(subcommand)]
        command: McpCommand,
    },
    Agent {
        #[command(subcommand)]
        command: AgentCommand,
    },
}

#[derive(Subcommand)]
enum CapsuleCommand {
    Create {
        #[arg(long)]
        issuer: String,
        #[arg(long)]
        artifact: String,
        #[arg(long)]
        change: PathBuf,
        #[arg(long, default_value_t = 30)]
        expires_in_days: u64,
        #[arg(long)]
        output: PathBuf,
    },
    Verify {
        path: PathBuf,
    },
    Apply {
        #[arg(long)]
        capsule: PathBuf,
        #[arg(long)]
        apply: bool,
        #[arg(long)]
        approve: bool,
        #[arg(long)]
        trust_issuer: Option<String>,
    },
}
#[derive(Subcommand)]
enum McpCommand {
    Serve,
}

#[derive(Subcommand)]
enum AgentCommand {
    RunOnce {
        #[arg(long)]
        project: String,
    },
    Serve {
        #[arg(long)]
        project: String,
        #[arg(long, default_value_t = 10)]
        poll_seconds: u64,
    },
}

fn print<T: serde::Serialize>(value: &T) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(value)?);
    Ok(())
}

struct Hosted {
    api_url: String,
    organization: String,
    api_key: String,
    client: reqwest::blocking::Client,
}

impl Hosted {
    fn from_env() -> Result<Self> {
        let required = |name: &str| {
            env::var(name).map_err(|_| anyhow::anyhow!("{name} is required for hosted agent mode"))
        };
        Ok(Self {
            api_url: required("CONTINUITY_API_URL")?.trim_end_matches('/').into(),
            organization: required("CONTINUITY_ORGANIZATION")?,
            api_key: required("CONTINUITY_API_KEY")?,
            client: reqwest::blocking::Client::builder()
                .timeout(Duration::from_secs(30))
                .build()?,
        })
    }

    fn post(&self, path: &str, payload: &Value) -> Result<Value> {
        let response = self
            .client
            .post(format!("{}{}", self.api_url, path))
            .bearer_auth(&self.api_key)
            .header("x-continuity-organization", &self.organization)
            .json(payload)
            .send()?;
        let status = response.status();
        let value: Value = response.json()?;
        if !status.is_success() {
            anyhow::bail!(
                "hosted API rejected the request ({status}): {}",
                value["error"].as_str().unwrap_or("unknown error")
            );
        }
        Ok(value)
    }
}

fn simulation_summary(simulation: &Simulation) -> Value {
    json!({
        "change_id": simulation.change_id,
        "project_hash": simulation.project_hash,
        "finding_count": simulation.findings.len(),
        "repairable_count": simulation.findings.iter().filter(|finding| finding.status == "repairable").count()
    })
}

fn execute_hosted_job(root: &std::path::Path, hosted: &Hosted, project: &str) -> Result<Value> {
    let claimed = hosted.post("/v1/events/claim", &json!({"project_id": project}))?;
    let Some(job) = claimed.get("data").filter(|value| !value.is_null()) else {
        return Ok(json!({"claimed": false}));
    };
    let job_id = job["id"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("job id missing"))?;
    let kind = job["kind"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("job kind missing"))?;
    let input = &job["input"];
    let change: ChangeSet = serde_json::from_value(input["change"].clone())
        .context("hosted job contains an invalid change")?;

    let (state, output) = match kind {
        "simulations" => match simulate(root, &change) {
            Ok(result) => (
                "awaiting_approval",
                json!({"simulation": simulation_summary(&result)}),
            ),
            Err(error) => ("failed", json!({"error": error.to_string()})),
        },
        "migrations" => {
            if input["authorized"] != true || input["dry_run_reviewed"] != true {
                (
                    "rejected",
                    json!({"error":"write authorization and reviewed dry run are required"}),
                )
            } else {
                hosted.post(&format!("/v1/events/{job_id}/heartbeat"), &json!({}))?;
                match migrate(root, &change) {
                    Ok((simulation, checks, attestation)) => (
                        "verified",
                        json!({
                            "simulation": simulation_summary(&simulation),
                            "checks": checks,
                            "attestation": attestation
                        }),
                    ),
                    Err(error) => ("failed", json!({"error": error.to_string()})),
                }
            }
        }
        _ => ("failed", json!({"error":"unsupported hosted job kind"})),
    };
    hosted.post(
        &format!("/v1/events/{job_id}/complete"),
        &json!({"state": state, "output": output}),
    )?;
    Ok(json!({"claimed": true, "job_id": job_id, "kind": kind, "state": state}))
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Init => {
            init(&cli.root)?;
            print(&serde_json::json!({"initialized": true, "root": cli.root}))
        }
        Commands::Scan => print(&scan(&cli.root)?),
        Commands::Simulate { change } => print(&simulate(&cli.root, &load_change(&change)?)?),
        Commands::Repair {
            change,
            apply,
            approve,
        } => print(&repair(&cli.root, &load_change(&change)?, apply, approve)?),
        Commands::Verify => print(&verify(&cli.root)?),
        Commands::Export { change, output } => {
            let change = load_change(&change)?;
            let evidence = attest(&cli.root, &change, verify(&cli.root)?)?;
            let path = cli.root.join(output);
            if let Some(parent) = path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&path, serde_json::to_vec_pretty(&evidence)?)?;
            print(&serde_json::json!({"verified": true, "attestation": path}))
        }
        Commands::AttestationVerify { path } => {
            let evidence: Attestation = serde_json::from_slice(&fs::read(path)?)?;
            verify_attestation(&evidence)?;
            print(&serde_json::json!({"valid": true, "verified": evidence.verified}))
        }
        Commands::Capsule {
            command:
                CapsuleCommand::Create {
                    issuer,
                    artifact,
                    change,
                    expires_in_days,
                    output,
                },
        } => {
            let expires =
                SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + expires_in_days * 86_400;
            let capsule =
                create_capsule(&cli.root, issuer, artifact, load_change(&change)?, expires)?;
            fs::write(&output, serde_json::to_vec_pretty(&capsule)?)?;
            print(&json!({"created": true, "capsule": output}))
        }
        Commands::Capsule {
            command: CapsuleCommand::Verify { path },
        } => {
            let capsule: MigrationCapsule = serde_json::from_slice(&fs::read(path)?)?;
            verify_capsule(&capsule)?;
            print(&json!({"valid": true, "issuer": capsule.issuer, "artifact": capsule.artifact}))
        }
        Commands::Capsule {
            command:
                CapsuleCommand::Apply {
                    capsule,
                    apply,
                    approve,
                    trust_issuer,
                },
        } => {
            let capsule: MigrationCapsule = serde_json::from_slice(&fs::read(capsule)?)?;
            verify_capsule(&capsule)?;
            let trusted = capsule_issuer_trusted(&cli.root, &capsule.issuer)?
                || trust_issuer.as_deref() == Some(capsule.issuer.as_str());
            if !trusted {
                anyhow::bail!(
                    "untrusted capsule issuer; review it and pass --trust-issuer with the exact issuer"
                );
            }
            print(&repair(&cli.root, &capsule.change, apply, approve)?)
        }
        Commands::Mcp {
            command: McpCommand::Serve,
        } => mcp::serve(&cli.root),
        Commands::Agent {
            command: AgentCommand::RunOnce { project },
        } => print(&execute_hosted_job(
            &cli.root,
            &Hosted::from_env()?,
            &project,
        )?),
        Commands::Agent {
            command:
                AgentCommand::Serve {
                    project,
                    poll_seconds,
                },
        } => {
            let hosted = Hosted::from_env()?;
            loop {
                let result = execute_hosted_job(&cli.root, &hosted, &project)?;
                print(&result)?;
                if result["claimed"] != true {
                    thread::sleep(Duration::from_secs(poll_seconds.max(1)));
                }
            }
        }
    }
}
