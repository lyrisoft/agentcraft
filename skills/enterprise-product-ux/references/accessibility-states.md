# Accessibility, states, and enterprise trust

Target WCAG 2.2 AA for web experiences unless project requirements specify otherwise. Compliance requires testing: do not claim it merely from inspecting components.

## Accessibility checks

- Semantic structure and controls with meaningful accessible names
- Logical keyboard navigation, visible focus, and focus return from dialogs
- Labels and errors programmatically associated with controls
- Announcements for important asynchronous updates, without excessive noise
- Contrast, reflow, zoom, reduced motion, and target-size considerations
- Status meaning conveyed by text and structure, not color alone
- Table headers, row selection, sorting, filters, and actions operable with assistive technology
- Responsive flows that allow actual task completion on supported devices

## State checklist

| State | What users need |
| --- | --- |
| Initial or empty | Reason for absence and useful next step |
| Search with no matches | Filter context and clear/reset options |
| Loading | Accurate progress; avoid jumpy layout |
| Queued | Do not imply the operation has started |
| Running | Distinguish in-progress from completed |
| Partial results | Clearly identify incomplete data |
| Failed | Known impact and viable recovery step |
| No access | Respect permissions without leaking data |
| Validation error | Field-specific correction guidance |
| Success | Only server-confirmed outcomes |
| Canceled | Whether a process actually stopped |
| Session expired/offline | Recovery preserving work when supported |

## Safety and integrity

Before deletion, payment, privileged change, bulk operation, or cross-tenant action: identify resources, scope, consequences, and realistic recovery. Use proportionate confirmation. Separate authorization enforced by services from merely hidden UI. Do not fabricate audit trails, approval steps, encryption assurances, or success claims.

## Localization

Use the project's translation architecture; account for plural rules, long strings, RTL where relevant, dates, currencies, and time zones. Never hard-code English into an otherwise localized application.

## Validation confidence

Distinguish source inspected, UI manually tested, automated test run, and actual user-research validation. These are different levels of evidence.