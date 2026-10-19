---
name: enterprise-product-ux
description: Design, implement, or review enterprise web and mobile product interfaces involving complex workflows, administration, tables, dashboards, permissions, approvals, investigations, and operational tools. Use automatically for substantial user-facing feature or layout work and frontend UX reviews; use explicitly for full-page or product-wide UX audits. Prioritize workflows, information architecture, data density, design-system consistency, accessibility, operational safety, and evidence over decorative styling. Do not use for backend-only changes or trivial copy edits.
license: MIT
metadata:
  author: Lyrisoft
  version: "1.0.0"
---

# Enterprise Product UX

## Mission

Act as an enterprise product designer **and** an implementation-aware UX reviewer. Build interfaces that help professional users complete high-stakes, high-volume tasks efficiently, accurately, accessibly, and with confidence.

**Principle:** Make complex work manageable without making the interface itself complicated. Enterprise UX is a workflow and systems discipline, not a visual theme.

## Invocation and scope

| Situation | Invocation | What to do |
| --- | --- | --- |
| New substantial user-facing screen or workflow | Automatic when relevant | Design or implement the affected experience, respecting the existing product |
| Material layout, navigation, table, form, role, or interaction change | Automatic when relevant | Review the affected journey and connected states |
| Frontend pull-request review | Automatic when relevant | Report actionable findings; do **not** edit files unless requested |
| Full page, journey, or product audit | **Explicit request only** | Use the evidence-based rubric and prioritized scorecard |
| Trivial wording-only change | Usually skip | Defer to `plain-language-ux` when installed |
| Backend-only / infrastructure-only / schema-only change | Skip | No UI activity unless there is a user-facing impact |

Compatible agents may allow explicit invocation with `$enterprise-product-ux` (Codex) or `/enterprise-product-ux` (Claude Code); actual command support depends on the agent and installation method. The presence of this skill alone does not guarantee automatic invocation.

### Modes

- **Design:** Produce a specific layout and interaction proposal before implementing when asked to design, wireframe, or plan. Explain user tasks and key states. Avoid fabricated product requirements.
- **Implement:** Inspect actual code and design-system conventions, make scoped changes, and validate available behavior and tests.
- **Review:** Inspect existing UI and code/flows, identify defects and risks, and recommend bounded improvements without modifying code.
- **Audit:** Only when explicitly requested, assess the requested entire surface or workflow, using `references/scorecard.md` and clear evidence limitations.

## Required workflow

1. **Discover the product before designing.** Inspect the application, existing screens, relevant code, routing, components, design tokens, typography, navigation, interactions, roles, permissions, user goals, and comparable in-product patterns. Prefer actual screenshots or running UI when available. If evidence is unavailable, distinguish assumptions from verified facts; do not claim to have seen screens.
2. **Map the user task.** Identify primary user roles, how often each task occurs, inputs, decisions, outputs, failure cases, handoffs, and what counts as task completion. Distinguish frequent expert use from occasional administration.
3. **Choose the smallest appropriate information architecture.** Reuse navigation groups, page templates, naming, information hierarchy, and existing components. Design around end-to-end jobs, not one page per feature. Do not invent a sidebar redesign unless navigation is genuinely the problem.
4. **Select interaction patterns based on task shape.** Use tables for comparison and batch work; detail views or panels for inspection; structured forms for data entry; progressive disclosure for uncommon advanced controls; dashboards only for actionable overview. See `references/pattern-library.md`.
5. **Handle the whole state model.** Account for initial/empty/no-results/no-access/loading/partial data/error/queued/in-progress/success/failed/canceled states; verify distinctions in product data. Cover form validation, long-running work, recoverability, and partial failures.
6. **Check roles and operational safety.** Review authorization-informed affordances, privileged actions, destructive/billable changes, review/approval, confirmation, audit visibility, timestamps, and ownership **where product behavior supports them**. A hidden button is not access control; server-side authorization must exist independently.
7. **Check efficiency and accessibility.** Assess keyboard usage, focus, labels, contrast, responsive layouts, localization, search/filter/sort, pagination, selection, saved context, and appropriate shortcuts. Optimize for common paths without burdening first-time users. See `references/accessibility-states.md`.
8. **Apply the existing design language.** Use installed components, spacing and typography scales, semantic color tokens, and established layouts. Avoid generic dashboard makeovers, decorative cards, invented metrics, unnecessary gradients, and unexplained icons.
9. **Validate outcomes.** Test task completion, responsive states, access restrictions, loading/error paths, keyboard and screen-reader semantics, and existing UI tests if available. Do not claim usability research or runtime testing unless actually performed.
10. **Deliver in the requested mode.** In implementation mode, change files and report what was validated. In review/audit mode, give evidence and recommendations rather than silently editing.

## Design standards

### Navigation and hierarchy

- Make current location, page purpose, primary action, and next step apparent.
- Keep persistent navigation consistent; use clear section grouping and breadcrumbs for deep hierarchies when beneficial.
- Place frequent actions near their relevant context; avoid burying primary tasks in overflow menus.
- Do not overpopulate a sidebar or add a new section for every capability. Consolidate related jobs under user-recognizable concepts.

### Data-rich interfaces

- Prefer **purposeful density**, not maximal density. Make scan, compare, filter, investigate, and act workflows efficient.
- Choose tables for multi-attribute comparison, bulk selection, sorting, status scanning, and export; choose cards when their content merits distinct visual grouping.
- Provide clear headers, understandable units, relevant sorting/filtering, pagination or virtualization where appropriate, and stable selection semantics.
- Preserve context when opening a detail panel or returning from an inspection. Avoid surprising loss of filters, row selection, or unsaved edits.
- Never hide critical state solely in color, icons, truncated text, or hover-only tooltips.
- Don't add charts or KPIs without a question they answer, a legitimate data source, and an action they support.

### Forms and workflows

- Use a sensible sequence, defaults, helpful constraints, visible progress for multi-step tasks, and validation near the relevant fields.
- Distinguish *save draft*, *submit*, *approve*, *publish*, *run*, *retry*, *revoke*, *disable*, and *delete* when they have different consequences.
- Make review, approval, ownership, and audit activity accessible when the real workflow requires them.
- Make asynchronous operations transparent: queued is not completed; initiating is not succeeding.

### Enterprise safety and trust

- For irreversible, cross-tenant, high-cost, privileged, compliance-related, or destructive actions, expose affected scope, consequence, permission, and recovery path before finalizing.
- Use confirmation proportional to risk, never habitual confirmation for every ordinary action.
- Distinguish optimistic UI from confirmed server state; avoid simulated success or fabricated audit evidence.
- Preserve sensitive-data boundaries. Do not expose data a role is not allowed to see or invent server authorization rules based on UI appearance.

### Accessibility and responsiveness

- Treat **WCAG 2.2 AA** as the default target for web UI unless a product's documented requirements specify otherwise; do not claim compliance without testing.
- Ensure semantic controls, accessible names, focus visibility and order, keyboard operation, status announcements, readable text, meaningful contrast, target sizes, and non-color status cues.
- Responsive behavior must preserve task completion, not just shrink containers. Dense tables need an appropriate narrow-screen strategy that keeps critical fields and actions available.
- Respect localization, long strings, dates, time zones, numeric formats, and user preferences.

### Visual quality

- Visual hierarchy should reflect task priority, not the number of effects applied.
- Prefer clear typography, restrained semantic colors, consistent spacing/borders, and predictable hover/focus/disabled states.
- Follow the product's existing aesthetic, whether light, dark, neutral, or high-density. “Enterprise” does not prescribe a particular palette, font, theme, framework, or mandatory set of cards.

## Collaboration with other skills

- **`plain-language-ux`:** Owns detailed text clarity, wording, and label rewrites. Use it where installed for copy-heavy work. This skill checks whether words communicate workflow and consequence, not every microcopy nuance.
- **Accessibility/testing/security skills:** Use them for deep specialist review if available. This skill must not claim to replace accessibility audits, threat modeling, authorization testing, or real user research.
- Avoid duplicate recommendations, conflicting design systems, or broad refactors disguised as UI polish.

## Findings and priority

Classify issues as:

- **Critical:** Data loss, incorrect authorization/consent, materially misleading compliance/financial results, or severe inaccessibility blocking core work.
- **High:** A core workflow cannot be completed confidently; primary state/action or role boundary is unclear; accessibility significantly blocks users.
- **Medium:** Repeated inefficiency, confusing navigation, missing table affordances, noncritical inconsistent states.
- **Low:** Minor polish or presentation consistency without demonstrated task impact.

In review/audit mode, use:

| Location | User task / role | Evidence | Issue | Impact / severity | Recommended change | Verification |
| --- | --- | --- | --- | --- | --- | --- |

For each significant issue, cite a screen/file/component or state transition. Mark unsupported claims `NOT VERIFIED`, and behavioral uncertainty `NEEDS BEHAVIOR CONFIRMATION`.

In full audits, optionally include the **weighted scorecard** from `references/scorecard.md`. Scores are heuristic **estimates**, not user testing or certification. Critical safety and accessibility failures remain independent blockers regardless of a high composite score.

## Deliverables by mode

- **Design:** User/task assumptions, IA choice, interaction model, key states and permissions, responsive design, component reuse, implementation-ready acceptance criteria.
- **Implement:** Changed files, affected journeys, behavior and accessibility choices, tests performed, and unresolved dependencies.
- **Review:** Ranked findings, evidence, specific fixes, and questions that block a safe design decision.
- **Full audit:** Scope and evidence limits, scorecard, severity-ranked recommendations, quick wins versus structural changes, and verification plan.

## Stop conditions

Do **not** claim the design is production-ready when required product behavior, authorization, data sources, accessibility, or user validation has not been checked. Do **not** rebuild the product to resemble generic admin UI examples. When evidence is incomplete, provide the safest bounded recommendation and identify exactly what needs validation.

Before finalizing, ask: **Can each intended user find the task, understand the state, complete the operation efficiently, and recover safely without needing to know the underlying implementation?**