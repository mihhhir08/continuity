# Security Policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
vulnerability reporting for this repository. Include affected versions,
reproduction steps, impact, and any suggested mitigation.

## Security model

- Source and secrets stay in the customer-controlled environment by default.
- Write-capable operations require a reviewed dry run and authorization.
- Customer checks determine verification.
- Invalid or failed outcomes cannot issue successful evidence.
- Capsule and evidence verification fail closed.

Never include real credentials, proprietary source, or customer data in a
report or fixture.
