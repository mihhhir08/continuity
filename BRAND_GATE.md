# ChangeTwin Brand Gate

Status: pending

The preferred future name is **ChangeTwin**. Do not rename product interfaces,
repositories, packages, deployments, or domains until every required gate is
complete.

## Required founder confirmation

- [ ] `changetwin.com` is purchased and controlled by the founder.
- [ ] A current US trademark search found no blocking conflict.
- [ ] Legal review approved the intended software and infrastructure use.
- [ ] npm, PyPI, and crates.io names were rechecked and reserved where needed.
- [ ] DNS access is available for production cutover.

When all checks are complete, change the status line to exactly:

```text
Status: cleared
```

Then perform the clean rename in one commit:

- `continuity` → `changetwin`
- `continuity://` → `changetwin://`
- `.continuity/` → `.changetwin/`
- Continuity → ChangeTwin across code, evidence identity, deployment, and docs
- current private repository → `changetwin-internal`
- fresh public repository → `mihhhir08/changetwin`

The public exporter refuses to run until the status is cleared and the renamed
crate exists.
