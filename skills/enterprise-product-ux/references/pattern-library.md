# Enterprise UX pattern library

Choose patterns based on the task, existing design system, audience, and data shape. Do not rebuild screens to look like a generic admin dashboard.

## Navigation and information architecture

Organize navigation around end-to-end jobs, not backend services. Keep persistent navigation stable. Use breadcrumbs only when hierarchy is deep enough to warrant them. Preserve search, filters, and selection when opening record details or returning to a list.

## Tables and investigation

Use tables when people compare multiple records, scan attributes, apply filters, or select multiple items. Provide meaningful column headings, search, appropriate sorting and filters, clear counts and pagination, selection scope, accessible row actions, and effective no-results/loading/error states. Avoid important information that is only visible on hover, in a truncated cell, or through color.

A detail panel is useful for quick inspection without leaving the list; use a dedicated detail page for complex investigations that need space for evidence and audit history.

## Forms and approvals

Group fields around user goals, use persistent labels, sensible defaults, inline validation, and clear save/submit/approve distinctions. For risk-sensitive actions, describe affected scope, consequences, and recovery before confirming. Confirmation frequency must be proportional to risk.

## Dashboards

A dashboard should answer known operational questions using real, appropriately fresh data. Prioritize exceptions and decisions over decorative metric cards. Every important visualization should answer a question and support a next step. Never fabricate KPIs.

## Progressive disclosure and expert efficiency

Keep frequent tasks visible. Defer uncommon complexity into contextually appropriate advanced areas. Provide shortcuts, saved views, and batch operations where they materially improve repeat work.

## Responsive design

Do not shrink a wide data grid into unusable narrow columns. Preserve key identifiers and actions using scroll, focused list/detail views, or column-priority patterns according to the task. Ensure keyboard, touch, zoom and translation continue to work.

## Anti-patterns

Navigation sprawl; card-only layouts for comparison data; stacked modals; indiscriminate confirmation dialogs; fake success toasts; disappearing filters; meaningless charts; unexplained status colors; hidden critical controls.

## Before applying a pattern

Record the user task, role, evidence from existing screens/components, chosen pattern, trade-offs, relevant system states, and behavioral questions that require confirmation.