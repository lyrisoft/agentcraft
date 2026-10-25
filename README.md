# Agentcraft

**Reusable skills for better AI coding agents.** An open-source collection maintained by [Lyrisoft](https://github.com/lyrisoft).

Agentcraft publishes portable [Agent Skills](https://agentskills.io/) that help coding agents produce clearer interfaces, review changes, and follow practical engineering standards. Skills are organized under `skills/<skill-name>/SKILL.md` so compatible tools can discover and install them.

## Available skills

| Skill | Purpose |
| --- | --- |
| [Plain Language UX](skills/plain-language-ux/) | Detect technical jargon, vague actions, ambiguous labels, unclear feedback, and inconsistent wording; recommend language that fits the intended audience without losing accuracy. |
| [Enterprise Product UX](skills/enterprise-product-ux/) | Design and review enterprise workflows, complex data interfaces, permissions, accessibility, and operational UX. |
| [Session Isolation Security](skills/session-isolation-security/) | Assess cross-user authorization, IDOR/BOLA, tenant isolation, roles, and session lifecycle; define reproducible security regressions. |
| [Repository Map](skills/repo-map/) | Explore JavaScript/TypeScript architecture through folder drilldown, paged endpoint catalogs, readable focused traces, Git change impact and imported SARIF findings. |

## Install

For Repository Map:

```bash
npx skills add lyrisoft/agentcraft --skill repo-map
```

Run `npm ci --omit=dev --ignore-scripts` in the installed skill directory to install the pinned TypeScript and Cytoscape dependencies, then ask your agent to map the repository. Reports are self-contained local HTML snapshots. Architecture starts with source-folder summaries; open a folder or select an endpoint to explore readable connections. Large catalogs and connection lists are paginated. Express, Fastify, NestJS and Next.js App Router patterns are supported with explicit analysis limits. Add `--base main` (or a commit SHA) to compare the working tree and explore potential change impact.

For session-isolation-security:

```bash
npx skills add lyrisoft/agentcraft --skill session-isolation-security
```


For enterprise-product-ux:

```bash
npx skills add lyrisoft/agentcraft --skill enterprise-product-ux
```


Install the Plain Language UX skill in your current project using the cross-agent [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add lyrisoft/agentcraft --skill plain-language-ux
```

Install globally:

```bash
npx skills add lyrisoft/agentcraft --skill plain-language-ux -g
```

Choose specific agents (example: Codex and Claude Code):

```bash
npx skills add lyrisoft/agentcraft --skill plain-language-ux -a codex -a claude-code
```

List skills without installing:

```bash
npx skills add lyrisoft/agentcraft --list
```

**Agent compatibility:** The portable `SKILL.md` format is designed for tools supporting Agent Skills. Actual discovery and invocation depend on the agent and installation configuration. Other compatible agents can read or copy `skills/plain-language-ux/`.

### Activate automatically for relevant UI work

The skill's description allows compatible agents to select it on relevant tasks. For more consistent repository-wide application, run its optional Python installer, which copies the skill into Codex and Claude Code directories and adds a managed wording policy to `AGENTS.md` and `CLAUDE.md` without overwriting unrelated instructions:

```bash
git clone https://github.com/lyrisoft/agentcraft.git
python3 agentcraft/skills/plain-language-ux/scripts/install.py --project /path/to/your-project
```

Manual full audits are always supported:

```text
$plain-language-ux Audit our onboarding UI. Report issues only.
```

```text
/plain-language-ux Review our settings UI and improve unclear copy.
```

Installing a skill or adding repository instructions is not a deterministic CI enforcement mechanism. For mandatory checks, add a review gate to your workflow.

## Repository layout

```text
skills/
  repo-map/
    SKILL.md
    package.json
    scripts/
    assets/
    references/
  plain-language-ux/
    SKILL.md
    README.md
    references/
    evals/
    scripts/
    tests/
  session-isolation-security/
    SKILL.md
    README.md
  enterprise-product-ux/
    SKILL.md
    README.md
    references/
    evals/
    tests/
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep contributions agent-independent, accessible, context-aware, and backed by verifiable behavior. Do not turn specialized terms into vague alternatives that distort product meaning.

## License

[MIT](LICENSE). Copyright © 2026 Lyrisoft Technologies Limited.
