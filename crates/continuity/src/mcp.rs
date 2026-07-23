use anyhow::Result;
use continuity::{load_change, repair, scan, simulate, verify};
use serde_json::{Value, json};
use std::{
    io::{self, BufRead},
    path::Path,
};

const TOOLS: &[(&str, &str)] = &[
    (
        "scan_project",
        "Scan the current project without changing files",
    ),
    ("list_change_risks", "List deterministic impact findings"),
    ("simulate_change", "Simulate a change locally"),
    ("propose_repair", "Return a mandatory dry-run repair"),
    ("apply_repair", "Apply an approved repair"),
    ("verify_migration", "Run customer-owned verification"),
    ("get_attestation", "Read an exported attestation"),
];

pub fn serve(root: &Path) -> Result<()> {
    for line in io::stdin().lock().lines() {
        let request: Value = serde_json::from_str(&line?)?;
        let id = request.get("id").cloned().unwrap_or(Value::Null);
        let method = request.get("method").and_then(Value::as_str).unwrap_or("");
        let result = match method {
            "initialize" => {
                json!({"protocolVersion":"2025-06-18","capabilities":{"resources":{},"tools":{}},"serverInfo":{"name":"continuity","version":"0.1.0"}})
            }
            "resources/list" => json!({"resources":[
                {"uri":"continuity://projects/current","name":"Current project"},
                {"uri":"continuity://projects/current/graph","name":"Change Twin"}
            ]}),
            "tools/list" => {
                json!({"tools": TOOLS.iter().map(|(name, description)| json!({"name":name,"description":description,"inputSchema":{"type":"object"}})).collect::<Vec<_>>()})
            }
            "tools/call" => {
                let params = &request["params"];
                let name = params["name"].as_str().unwrap_or("");
                let args = &params["arguments"];
                let value = match name {
                    "scan_project" => scan(root)?,
                    "list_change_risks" | "simulate_change" | "propose_repair" => {
                        let change = load_change(Path::new(args["change"].as_str().unwrap_or("")))?;
                        serde_json::to_value(simulate(root, &change)?)?
                    }
                    "apply_repair" => {
                        if args["dry_run_reviewed"] != true || args["authorized"] != true {
                            json!({"error":"write denied: dry_run_reviewed and authorized are required"})
                        } else {
                            let change =
                                load_change(Path::new(args["change"].as_str().unwrap_or("")))?;
                            serde_json::to_value(repair(root, &change, true, true)?)?
                        }
                    }
                    "verify_migration" => serde_json::to_value(verify(root)?)?,
                    "get_attestation" => serde_json::from_slice(&std::fs::read(
                        root.join(".continuity/attestation.json"),
                    )?)?,
                    _ => json!({"error":"unknown tool"}),
                };
                json!({"content":[{"type":"text","text":serde_json::to_string_pretty(&value)?}],"isError":value.get("error").is_some()})
            }
            _ => json!({}),
        };
        println!(
            "{}",
            serde_json::to_string(&json!({"jsonrpc":"2.0","id":id,"result":result}))?
        );
    }
    Ok(())
}
