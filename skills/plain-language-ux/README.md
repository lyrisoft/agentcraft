# Plain Language UX

A portable Agent Skill for clear, accurate UI writing. It identifies jargon, ambiguous terms, vague calls to action, unclear feedback, inaccessible labels, and inconsistent terminology. It avoids turning essential technical language into imprecise wording.

## Install with any supported agent

Use the [skills CLI](https://github.com/vercel-labs/skills) to install this skill in supported agents:

```bash
npx skills add lyrisoft/agentcraft --skill plain-language-ux
```

For a global installation:

```bash
npx skills add lyrisoft/agentcraft --skill plain-language-ux -g
```

For Codex and Claude Code specifically:

```bash
npx skills add lyrisoft/agentcraft --skill plain-language-ux -a codex -a claude-code
```

The agent itself chooses when to load an installed skill from its metadata. Skill installation alone does not guarantee automatic review of every UI change.

## Optional repository-wide automatic review instructions

Clone this repository and run the included installer, passing your target project path:

```bash
git clone https://github.com/lyrisoft/agentcraft.git
python3 agentcraft/skills/plain-language-ux/scripts/install.py --project /path/to/project
```

Use `--dry-run` to preview. Use `--agent codex` or `--agent claude` to select an agent. Use `--update` to replace locally modified copies after review.

The installer updates only its own marked section inside existing `AGENTS.md` / `CLAUDE.md` and copies the skill into the expected agent-specific directory. It does not modify application code.

## Invocation

- **UI implementation:** Apply to affected screens as part of development.
- **Frontend review:** Report unclear wording with severity without editing by default.
- **Full product audit:** Invoke explicitly with `$plain-language-ux` (Codex) or `/plain-language-ux` (Claude Code).
- **Backend work:** Skip unless user-facing wording is affected.

Try:

```text
$plain-language-ux Audit the merchant onboarding journey. Report only, no edits.
```

## Package files

- `SKILL.md` — core instructions and quality gate
- `references/word-choice.md` — wording examples and exceptions
- `references/review-checklist.md` — audit rubric
- `evals/scenarios.md` — 12 acceptance examples
- `scripts/install.py` — non-destructive project/global installer for Codex and Claude
- `tests/test_install.py` — installer smoke tests

Run tests:

```bash
cd skills/plain-language-ux
python3 -m unittest discover -s tests -v
```

**Principle:** The best label is not necessarily the shortest: it is the one that lets people predict the outcome correctly.
