# Contributing to Agentcraft

We welcome improvements to existing skills and proposals for new, portable agent skills.

## New skills

1. Create `skills/<lowercase-kebab-name>/SKILL.md` with YAML frontmatter containing `name` and `description`.
2. Describe when the skill should and should not be invoked, its workflow, constraints, and output expectations.
3. Use `references/` for optional guidance and `evals/` for scenarios that exercise the skill, including negative and uncertain cases.
4. Keep dependencies optional and document any required tools clearly. Avoid agent-specific assumptions in the core skill.
5. Update the root README catalog, then open a pull request.

## Quality expectations

- Skill instructions should be concise, testable, and focused on outcomes.
- Define guardrails, not just ideal success cases.
- Do not invent capabilities, outcomes, evaluation results, standards compliance, or external integrations.
- Protect secrets, personal data, and sensitive project content.
- Avoid breaking changes to existing skill paths without migration instructions.
- Add evaluation scenarios for ambiguous inputs, unsupported cases, and audience differences.

## Reviews and pull requests

Give each PR a clear summary, tests/evaluation notes, and any compatibility impact. New skills and changes to skill behavior should go through review. Respect the repository's branch protection settings.

## License

By contributing, you agree that your contribution will be licensed under the repository's MIT license.
