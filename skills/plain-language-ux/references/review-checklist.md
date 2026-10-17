# UX language audit checklist

Review areas that exist in the target interface. Mark non-applicable items N/A.

## Audience and vocabulary

- [ ] Identify audience and relevant expertise.
- [ ] Explain or retain specialized terminology based on that audience.
- [ ] Expand unfamiliar acronyms on first relevant use.
- [ ] Use one term per concept and distinguish different concepts.
- [ ] Explain what branded features do; a product name alone is not an action.

## Navigation and discovery

- [ ] Navigation describes destinations, not internal architecture.
- [ ] Page/section headings match the content.
- [ ] Empty states explain what is absent and how to proceed, when applicable.
- [ ] Search, filters, and result counts make scope clear.

## Actions and decisions

- [ ] Main buttons predict their effects.
- [ ] Different actions have different names.
- [ ] Destructive, billable, security-sensitive, and permission-related changes disclose consequences.
- [ ] Confirmation dialogs identify the affected object and the outcome.
- [ ] Cancel/back actions are distinct from a committed change.
- [ ] Icon-only controls have usable accessible labels.

## Forms, feedback, and status

- [ ] Form fields have persistent labels.
- [ ] Formats, units, validation constraints, and defaults are clear.
- [ ] Loading text accurately describes the active stage.
- [ ] Success text describes confirmed results, not requests.
- [ ] Errors identify a known problem and useful next step.
- [ ] Queued, active, blocked, pending, completed, and failed states are distinct.

## Technical accuracy and delivery

- [ ] UI copy matches handlers, routes, state transitions, and domain behavior.
- [ ] Legally significant words retain their required meaning.
- [ ] Visible and accessible labels align.
- [ ] Wording is concise, scannable, and localizable.
- [ ] Changes use existing translation sources and tests.
- [ ] Any uncertain behavior is documented rather than guessed.

## Scope

During regular UI work review only affected screens and adjacent context. For PR reviews prioritize changed copy. Audit a whole product only on request. Do not mass-replace by keyword.
