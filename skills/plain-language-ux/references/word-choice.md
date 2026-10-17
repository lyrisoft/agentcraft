# Word choice: conditional examples

These are **examples, not search-and-replace rules**. First verify the user's role, context and the actual effect of an action.

| Current copy | Clearer **if accurate** | Caveat |
|---|---|---|
| Execute | Run check | Verify the action is a check rather than a payment or deployment |
| Initiate onboarding | Start setup | If inviting a person, `Invite member` may be correct |
| Provision instance | Create server | Experienced cloud engineers may prefer `Launch instance` |
| Deploy agent | Install agent on server | Only if an installation actually occurs |
| Sync | Update records | Only if the operation is one-directional |
| Resolve | Mark as resolved | Do not imply the underlying issue is fixed |
| Terminate | Delete workspace | Only for permanent deletion; stopping is different |
| Revoke entitlement | Remove access | Clarify scope if multiple resources are affected |
| Attestation | Verified statement | Preserve legal terminology where required |
| KYC | Identity verification | May be clearer for consumers; specialists may prefer `KYC` |
| Resource orchestration | Manage servers | Only if servers are actually the resources |
| Check eligibility | Check if you qualify | Explain criteria when relevant |
| Authenticate | Sign in | For account access, not identity verification |
| Artifacts | Reports and evidence | Only if these are the actual contents |
| Configuration | Settings | For consumer settings; experts may prefer `Configuration` |
| No entities found | No matching people or businesses | Check search scope |
| Processing request | Checking your information… | Only when actively checking, not when queued |
| Something went wrong | We couldn't save your changes. Try again. | Only when save failure and retry are known |
| Success | Your report is ready to download | State a confirmed result |
| Click here | View invoice | Name the destination |
| Submit | Send application | If saving a draft, say `Save draft` |

## Keep technical language when it helps

- Terms like `PostgreSQL`, `replication`, `failover`, `webhook`, `API key`, and `audit log` are standard in many administrator interfaces.
- `NIN`, `BVN`, `KYC`, and `AML` may be familiar in Nigerian financial services. For general users, expand official terms at first meaningful use, where helpful.
- Official product names such as `Sovereign`, `Sentinel`, or `Identity Graph` should usually stay, with nearby explanation of what users can do.

## High-risk distinctions: never guess

- `Archive` is not `Delete`.
- `Disable` is not necessarily `Disconnect`.
- `Verify` is not `Approve`.
- `Detected` is not `Confirmed`.
- `Payment submitted` is not `Paid`.
- `Invite sent` does not mean `Member added`.
- Claims like `Encrypted`, `Private`, `Secure` or `Compliant` require actual support in the product and its policies.

## Useful patterns

**Confirmation:** Title: `Delete project?`; body: `This permanently deletes the project and its saved reports. This cannot be undone.`; buttons: `Cancel` / `Delete project`. Use only if all these facts are true.

**Recoverable error:** `We couldn't connect to the database. Check the host address and access settings, then try again.` Only if the diagnosis supports that advice.

**Empty state:** `No reports yet. Run your first check to create a report.`

**Expert term with explanation:** `Failover` — `Switch traffic to the standby database if the primary becomes unavailable.`
