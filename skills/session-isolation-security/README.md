# Session Isolation Security

A portable Agentcraft skill to review and test cross-user authorization, IDOR/BOLA, role enforcement, tenant separation and authenticated session lifecycle.

## Install

```bash
npx skills add lyrisoft/agentcraft --skill session-isolation-security
```

## Invoke

- Codex: `$session-isolation-security Review our API authorization and add regression tests for cross-tenant resource access.`
- Claude Code: `/session-isolation-security Review session revocation and horizontal IDOR risks.`

Compatible agents may auto-select this skill for relevant authorization work. A skill does **not** install Strix, Burp Suite, or ZAP.

## Live assessment requirements

Supply approved target hosts/environment, written or explicit testing authorization, two dedicated test accounts, their roles and tenants, excluded operations, and a safe testing window. Without those, the agent should restrict its work to source review or fixture-based regression tests.

Strix is optional; it may help explore permitted scenarios, but verified reproducible requests and deterministic API tests are the preferred acceptance gate.

## Output

Expect a coverage matrix, sanitized evidence for confirmed findings, remediation, skipped cases, and regression checks. No tool execution or security result should be claimed without evidence.
