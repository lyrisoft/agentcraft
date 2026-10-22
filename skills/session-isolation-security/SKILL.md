---
name: session-isolation-security
description: Review or test whether one authenticated user, role, or tenant can access another user's session or protected resources. Use for broken access control, IDOR/BOLA, RBAC, session lifecycle, and tenant isolation checks, including Strix-led assessments and CI regression tests. Only run live tests on explicitly authorized assets with dedicated accounts.
license: MIT
metadata:
  author: Lyrisoft
  version: "1.0.0"
---

# Session Isolation & Authorization Security

## Mission
Test that authenticated principals are restricted to their own permitted data, functions, sessions, and tenant boundaries. Differentiate **cross-user resource access (BOLA/IDOR)**, **vertical privilege escalation (BFLA/RBAC)**, **tenant isolation**, and **session-management failures**. Access to another user's object is not necessarily proof of session hijacking.

## When to invoke
- Automatically: reviews or regression-test requests concerning authentication, ownership, roles, tenant boundaries or sessions.
- Explicitly: `$session-isolation-security` (Codex) or `/session-isolation-security` (Claude Code), subject to agent support.
- Never launch active tests without explicit authorization for the target, environment, accounts, and test boundaries. Repository access alone is not authorization to scan a running service.

## Safe execution rules
1. Identify approved hosts, endpoints, environment, test window, and excluded operations. If not approved, perform static analysis or draft fixture-based tests only.
2. Use independently authenticated **test users A and B**, preferably in separate test organizations. Obtain a lower-privilege and administrator account only if authorized.
3. Use synthetic owned fixtures. Default to read-only operations and low request volume. For write tests, require explicit permission, disposable records and cleanup checks. Never exercise production payment, destructive, takeover or mass-enumeration paths.
4. Keep credentials, tokens, cookies, names, and private responses out of reports/logs. Store secrets only in approved encrypted configuration.
5. Stop on unintended effects and respect rate limits. Never expand scope automatically.
6. Distinguish test executed, test proposed, and test inconclusive.

## Required test matrix
For each endpoint record actor identity, role, tenant, resource owner, request method, expected behavior and observed result.

| Case | Test | Expected |
| --- | --- | --- |
| Anonymous | Request protected resource without credentials | Denied |
| Own resource | A accesses A-owned fixture | Permitted if policy allows |
| Horizontal | A's credentials request B-owned fixture | Denied unless explicitly shared |
| Cross-tenant | Tenant A identity requests Tenant B fixture | Denied absent explicit federation/sharing |
| Vertical | Member invokes admin-only endpoint | Denied |
| ID substitution | Change URL/query/body/GraphQL/batch object IDs | Ownership enforced on every object |
| Tenant context | Change client-supplied org/user/role IDs or headers | Server resolves and verifies membership |
| Session lifecycle | Logout, expiration, revocation and refresh rotation | Conforms to documented session policy |
| Indirect data | Search/list/count/export/attachment/audit endpoints | No unauthorized disclosures |

Test cookie versus Authorization-header precedence where both are accepted. Verify resource IDs nested in requests and child objects, not just top-level paths.

## Procedure
1. **Map the authorization model.** Inspect routes, middleware, OIDC/JWT validation, session store, object ownership, tenant resolution and permission rules. Document what is verified versus inferred.
2. **Establish baselines.** Verify that A can read allowed A-owned synthetic data and B can read allowed B-owned data using distinct sessions.
3. **Cross-user replay.** Keep B's resource ID while authenticating with A's own session; compare response and side effects against the permission model. Never reuse B's token to pretend an A test occurred.
4. **Cross-role/tenant.** Repeat for lower role and different tenant when in scope. Consider list/search, details, attachments, exports, mutations and nested references.
5. **Session review.** Examine expiry, logout invalidation, refresh rotation, revocation, cookie `Secure`/`HttpOnly`/`SameSite`/`Domain`/`Path`, and token audience/issuer/signature validation. Don't equate cookie flags with authorization.
6. **Confirm findings.** A `200` status alone does not prove exposure; a shared resource may be legitimately accessible. Inspect protected data/action and effective owner. A documented `403` or `404` can both be correct denials. Confirm with a safe repeat and negative control.
7. **Recommend fixes.** Enforce server-side per-object permissions and membership checks, deny-by-default, scope database queries by tenant/principal, validate role grants and add tests at service boundaries.
8. **Add deterministic regression tests.** Prioritize API/integration tests over relying only on an autonomous scan.

## Tool guidance
- **Strix:** use when installed and explicitly authorized; provide scope, two test identities, permissible operations, exclusions, and desired evidence. Review Strix's plan and independently reproduce purported issues. Do not claim Strix was run unless it was.
- **Burp Suite with Autorize/AuthMatrix:** compare requests authenticated as distinct test principals and roles.
- **OWASP ZAP:** inspect and reproduce HTTP requests and authorization behavior.
- **pytest / Playwright API / Postman-Newman:** create stable CI assertions, using disposable test accounts/fixtures.

### Suggested Strix task
> Assess only the explicitly approved staging application for broken object authorization, horizontal and vertical privilege escalation, cross-tenant leaks, and session lifecycle flaws. Use provided A/B test identities and synthetic fixtures. Compare A's credential against B-owned resource identifiers; do not read unapproved user data, run destructive operations, enumerate live users, or change payment/account settings. Produce sanitized, independently reproducible evidence. Mark untested checks clearly.

## CI test pattern (pseudocode)
```text
a_session = login(TEST_USER_A)
b_object = create_fixture(owner=TEST_USER_B)
response = GET("/api/objects/" + b_object.id, auth=a_session)
assert response.status in APPROVED_DENIAL_STATUSES
assert not contains_b_private_data(response)
```
Also test same-tenant ownership and separate-tenant identity cases. Do not expose auth credentials or bodies in logs.

## Finding/report template
- Scope, target environment, authorization and exclusions
- Coverage table: tested/passed/failed/skipped/inconclusive and tools **actually used**
- For each confirmed finding: title, severity + rationale, method/route, test-principal role/tenant, expected and actual behavior, redacted evidence, affected boundary, remediation, and regression check
- Unconfirmed observations and verification limitations
- Explicit statement that passing checks do not prove complete security

## Quality gates
- [ ] Approved scope and dedicated identities documented
- [ ] Ownership and tenant policy understood
- [ ] Read-only default; no unauthorized state changes
- [ ] Horizontal, vertical and session cases assessed where applicable
- [ ] No secrets or personal data in evidence
- [ ] Findings reproduced and distinguished from suspicions
- [ ] Automated regression coverage proposed or implemented
