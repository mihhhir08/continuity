mod mcp;

use anyhow::Result;
use clap::{Parser, Subcommand};
use continuity::{
    Attestation, attest, init, load_change, repair, scan, simulate, verify, verify_attestation,
};
use std::{fs, path::PathBuf};

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
}

#[derive(Subcommand)]
enum CapsuleCommand {
    Apply {
        #[arg(long)]
        change: PathBuf,
        #[arg(long)]
        approve: bool,
    },
}
#[derive(Subcommand)]
enum McpCommand {
    Serve,
}

fn print<T: serde::Serialize>(value: &T) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(value)?);
    Ok(())
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
            command: CapsuleCommand::Apply { change, approve },
        } => print(&repair(&cli.root, &load_change(&change)?, true, approve)?),
        Commands::Mcp {
            command: McpCommand::Serve,
        } => mcp::serve(&cli.root),
    }
}
