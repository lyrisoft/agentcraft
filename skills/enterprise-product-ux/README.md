# Enterprise Product UX

**A reusable Agentcraft skill that treats enterprise design as workflow engineering—not just visual styling.** It guides Codex, Claude Code and other compatible AI coding agents when designing, building or reviewing complex applications.

It is intended for admin consoles, B2B SaaS products, investigations, risk platforms, infrastructure tools, operational dashboards and other professional products.

## What it covers

- Task-driven information architecture and navigation
- Dense tables, search, filtering, saved context and investigation workflows
- Multi-step forms, approvals, permissions and operational safety
- Asynchronous states, partial failure, recovery and audit evidence
- Responsive, keyboard-accessible interfaces targeting WCAG 2.2 AA
- Reuse of existing design systems and component libraries
- Evidence-based UX review and an **optional** seven-dimension scorecard

## Install

Install from the [Agentcraft repository](https://github.com/lyrisoft/agentcraft) with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add lyrisoft/agentcraft --skill enterprise-product-ux
```

For global installation:

```bash
npx skills add lyrisoft/agentcraft --skill enterprise-product-ux -g
```

To target Codex and Claude Code, where supported:

```bash
npx skills add lyrisoft/agentcraft --skill enterprise-product-ux -a codex -a claude-code
```

Alternatively copy the entire `skills/enterprise-product-ux/` folder into your agent's supported skills directory. The `SKILL.md` file uses the standard agent skill structure; installation and invocation behavior depend on the specific agent.

## Invoke

**Design:**

```text
$enterprise-product-ux Design a findings investigation experience.
Reuse our existing components and include loading, empty, error, and permission states.
```

**Implementation:**

```text
$enterprise-product-ux Implement the merchant approval workflow in the existing app.
Use the current design system and validate real application behavior.
```

**Review without edits:**

```text
/enterprise-product-ux Review the changed frontend screens in this PR.
Report severity-ranked issues and don't modify code.
```

**Full audit (explicit only):**

```text
$enterprise-product-ux Audit our enterprise dashboard and provide the weighted UX scorecard.
State the screens and flows you could not verify.
```

Note: The `$` and `/` prefixes are examples for compatible Codex/Claude Code skill invocation; check the host agent's supported command syntax.

## Automatic use

The `SKILL.md` description advertises when the skill is relevant. For more consistent invocation, add these instructions to your project-level `AGENTS.md` and `CLAUDE.md`:

```markdown
## Enterprise UX standard

- Invoke the enterprise-product-ux skill when implementing or substantially changing a user-facing enterprise screen, workflow, navigation, data table, form or operational console.
- During frontend PR review, use the skill to report significant UX concerns without editing files unless requested.
- Preserve the current product's design system, patterns, roles and workflow semantics; do not apply generic dashboard templates.
- Require an explicit request before running a full-page, full-journey or whole-product UX audit.
- Skip this skill for backend-only work and trivial copy edits.
- Use plain-language-ux for detailed microcopy review when installed.
```

These instructions improve consistency but **do not enforce deterministic invocation**. For mandatory review, integrate an independent workflow or review gate.

## Package

```text
enterprise-product-ux/
├── SKILL.md
├── README.md
├── references/
│   ├── pattern-library.md
│   ├── accessibility-states.md
│   └── scorecard.md
├── evals/
│   └── scenarios.md
└── tests/
    └── test_skill_contract.py
```

## Validation

Run the packaged structural tests:

```bash
python3 -m unittest discover -s skills/enterprise-product-ux/tests -v
```

These tests check skill metadata and completeness. They do not replace running the evaluation scenarios against real agent behavior or performing human-centered UX research.

## Relationship to Plain Language UX

- `enterprise-product-ux` evaluates tasks, information architecture, data handling, states, permissions, accessibility, and layout.
- `plain-language-ux` checks headings, labels, messages, and the words used to express an action or outcome.

When both apply, keep the review scoped and do not duplicate findings.

## License

MIT — same license as the Agentcraft repository.
