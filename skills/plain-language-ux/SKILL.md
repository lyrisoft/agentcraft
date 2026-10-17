---
name: plain-language-ux
description: Review and improve user-facing language when implementing or reviewing web/mobile interfaces, settings, onboarding, forms, buttons, errors, statuses, and frontend pull requests. Identify technical jargon, ambiguous labels, vague actions, misleading feedback and unexplained acronyms. Keep precise terminology for expert audiences; preserve behavior, accessibility, and localization. Run full-product audits only when explicitly requested. Skip backend-only and infrastructure-only work.
---

# Plain Language UX

## Purpose

Help people understand **what they can do, what will happen, and what to expect next**. Simplicity is not the fewest words; it is the least effort needed to understand and act correctly. Preserve accuracy even when a shorter alternative exists.

Apply this skill to user-visible UI copy and product explanations, never indiscriminately to code symbols or internal architecture.

## Invocation

- **Automatic, UI implementation:** When creating or changing a user-facing interface, review the affected copy and adjacent context. Fix clear issues within scope; do not start an unrelated whole-product overhaul.
- **Automatic, frontend code review:** Inspect changed user-visible text and relevant UI context. Report findings with severity and evidence; do not edit code during a review unless asked.
- **Explicit, full audit:** Review an entire screen, journey, or product only when requested. Codex users can invoke `$plain-language-ux`; Claude Code users can invoke `/plain-language-ux`.
- **Skip:** Backend-only, infrastructure-only, database schema, and internal refactoring work with no customer-visible impact.

Skill selection is agent-dependent. To make application more consistent, use repository rules in `AGENTS.md` or `CLAUDE.md`; for deterministic enforcement, use a separate review gate.

## Step-by-step workflow

1. **Understand the audience.** Determine who uses the screen, their expertise, the task they are trying to accomplish, and their likely vocabulary. Do not treat specialists like beginners.
2. **Understand actual behavior.** Inspect UI handlers, routes, state transitions, validation, and supporting docs before changing a meaningful label. Never infer destructive, billable, or permission-related behavior from existing text.
3. **Collect user-visible strings.** Include headings, navigation, buttons, links, forms, helper text, placeholders, dialogs, accessible names, notifications, status chips, errors, empty states, consent, and onboarding.
4. **Detect friction.** Apply the tests below; consult `references/review-checklist.md` and `references/word-choice.md`.
5. **Classify.** Use `JARGON`, `AMBIGUOUS`, `VAGUE_ACTION`, `MISSING_CONTEXT`, `UNEXPLAINED_ACRONYM`, `INCONSISTENT`, `MISLEADING`, `UNCLEAR_FEEDBACK`, `ACCESSIBILITY`, or `UNNECESSARY_WORDS`.
6. **Choose keep / explain / replace.** Keep familiar expert terms when precise; explain specialized terms when necessary; replace internal or opaque language when it adds friction. A word is not wrong simply because it is technical.
7. **Validate the alternative.** Confirm that it matches product behavior, audience expectations, translation conventions, accessibility, and the consequence of the action.
8. **Implement or report** according to the request. During implementation, only update the relevant copy sources and run available tests. During audits, provide ranked recommendations without edits unless asked.

## Tests for unclear language

- **Audience:** Would a target user recognize the term without knowing our implementation?
- **Meaning:** Could two reasonable people understand this differently?
- **Action:** Before clicking, can a user predict the operation and affected object?
- **Consequence:** Is it clear if an action is irreversible, billed, security-sensitive, or affects others?
- **Context:** Would a link or button still make sense when read by assistive technology or outside the visual layout?
- **Recovery:** Does an error explain the known problem and a useful next step?
- **Acronyms:** Is each abbreviation familiar to this audience or explained at first use?
- **Consistency:** Is the same concept named consistently? Do distinct operations have distinct names?
- **Accuracy:** Would simplifying this term remove a distinction needed for a correct decision?

If any question is uncertain, flag it rather than assuming an answer.

## Copy guidance

### Buttons, links, and dialogs

- Name **action + object** when useful: `Invite member`, `Run check`, `Download report`.
- Replace vague labels such as `Execute`, `Proceed`, `Submit`, or `Confirm` **when they hide the outcome**. `Save` and `Done` are fine where context is unambiguous.
- Distinguish `Fix issue` from `Mark as resolved`, `Delete` from `Archive`, and `Disable` from `Disconnect`.
- On destructive or billable actions, state the scope and consequence in the dialog; use a clear confirm label and safe exit.
- Pair unusual icon-only controls with a visible label where feasible; use accurate accessible names.

### Headings, navigation, and forms

- Use the words users look for, not architecture or internal team names.
- Titles should indicate destinations; section headings should describe the contents.
- Provide persistent field labels; placeholders alone are insufficient.
- Explain required formats and specialized terms near the relevant field. Prefer a concise label plus one line of useful helper text.

### Feedback and status

- State **what happened**, not what merely started. `Invitation sent` is appropriate only when sending succeeded.
- For errors, explain the known problem, its effect, and a recovery path; never leak stack traces or blame users.
- Prefer specific progress text such as `Checking your information…` over `Processing…` where the stage is known.
- Preserve distinctions between queued, processing, under review, approved, rejected, canceled, and failed.
- Empty states should say what is absent and what the user can do next, if anything.

## Severity

| Level | When to use |
| --- | --- |
| Critical | Copy may lead to data loss, incorrect consent, security exposure, surprise charges, or materially wrong regulated decisions |
| High | Main actions, permissions, onboarding, or primary workflows are unclear or misleading |
| Medium | Navigation, form fields, statuses, or secondary actions create avoidable confusion |
| Low | Redundant words or small consistency and clarity improvements |

Prioritize by impact and likelihood, not by the number of technical words.

## Constraints

- Do not rename APIs, database columns, variables, resource identifiers, logs, legal terms, or product names simply to simplify copy.
- Do not silently change regulatory language or legal meaning; provide optional plain-language explanation alongside mandatory wording.
- Never assume `sync`, `archive`, `remove`, `revoke`, `reset`, `deactivate`, and `delete` are interchangeable.
- Never guess action behavior. If implementation intent cannot be established, report `NEEDS BEHAVIOR CONFIRMATION`.
- Do not imply success before confirmation; do not invent feature promises or actions.
- Preserve existing localization keys and avoid hard-coded strings in internationalized apps.
- Do not claim copy has been validated with users unless actual user testing occurred.
- Do not reveal personal, confidential, or credential information in audit output.

## Reporting

For audit/review mode, provide:

| Location | Original copy | Issue type | Severity | Proposed copy | Reason / verification |
| --- | --- | --- | --- | --- | --- |

After the table, summarize the highest-priority fixes, expert terms intentionally retained, and unresolved behavior questions. Provide relevant file paths and line numbers when available.

For implementation mode, change the relevant files; summarize before/after examples, checks run, and outstanding assumptions.

## Final quality gate

Before approving wording, confirm:

1. The intended user understands it on first encounter.
2. The next action or outcome is predictable.
3. The text is factually accurate, including scope, reversibility, and risk.
4. It is consistent, accessible, and translatable.
5. It is as short as possible **without sacrificing meaning**.
