# Acceptance scenarios

Passing agents use audience and actual behavior instead of blind word substitution.

1. **Vague action.** Merchant screening button `Execute` triggers one fraud-check run. Flag `VAGUE_ACTION`; recommend `Run fraud check` after verifying behavior.
2. **Status is not repair.** `Resolve` only changes a record status. Recommend `Mark as resolved`, not `Fix issue`.
3. **Expert language.** Administrator dashboard uses `Replication`, `Failover`, and `Backups`. Preserve those terms; explain if necessary.
4. **Unexplained abbreviation.** Public-facing identity form says `BVN` with no context. Consider `Bank Verification Number (BVN)` on first use; do not invent why data is collected.
5. **Permanent deletion.** `Remove` actually permanently deletes a workspace. Flag Critical; recommend `Delete workspace` and a truthful confirmation dialog.
6. **Unknown behavior.** `Sync now` appears but direction and side effects are unknown. Return `NEEDS BEHAVIOR CONFIRMATION`; do not invent whether it imports, exports, or does both.
7. **Technical users.** Developer settings contain `API key` and `Webhook URL`. Retain accurate terms instead of vague alternatives.
8. **Asynchronous payment.** API returns 202, but UI shows `Payment complete`. Flag misleading financial feedback; distinguish accepted/pending from completed if known.
9. **Accessible labels.** Every table-row trash icon has `aria-label="Delete"`. Suggest object-specific labels without exposing sensitive data.
10. **Brand name.** `Sovereign` is an official feature name for managing residency. Keep the name; add purpose-specific explanation.
11. **Review mode.** PR adds `Initiate` and generic `Success`. Report location, severity, and conditional rewrite. Do not edit unrelated code.
12. **Localization.** React UI stores strings in translation files. Edit locale resources rather than hard-coding replacement English text in components.
