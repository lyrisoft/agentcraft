#!/usr/bin/env python3
"""Install Plain Language UX for Codex and Claude Code without replacing existing rules.

Usage:
  python3 skills/plain-language-ux/scripts/install.py --project /path/to/repo
  python3 skills/plain-language-ux/scripts/install.py --global
  python3 skills/plain-language-ux/scripts/install.py --project . --dry-run
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

SKILL_NAME = "plain-language-ux"
BEGIN = "<!-- plain-language-ux:begin -->"
END = "<!-- plain-language-ux:end -->"
SOURCE = Path(__file__).resolve().parent.parent
SKILL_FILES = (
    Path("SKILL.md"),
    Path("references/word-choice.md"),
    Path("references/review-checklist.md"),
    Path("evals/scenarios.md"),
)


def instruction_block(agent: str) -> str:
    invocation = "$plain-language-ux" if agent == "codex" else "/plain-language-ux"
    return f"""{BEGIN}
## Plain Language UX — user-facing wording standard

- When building or modifying a user-facing UI, use the {SKILL_NAME} skill ({invocation}) for changed screens and their context.
- Examine headings, navigation, buttons, form labels, dialogs, permissions, statuses, errors, empty states, and accessible labels for technical jargon, vague actions, ambiguity, and inconsistent terminology.
- Preserve accurate specialist terminology, product behavior, legal meaning, accessibility, and localization patterns. Check the handler and relevant docs before changing a label that describes an outcome.
- During implementation, improve clear wording issues within scope. During frontend PR review, report issues and severity without editing code unless asked.
- Audit a whole product or journey only when explicitly requested. Do not turn every frontend task into a whole-app audit.
- Skip backend-only, infrastructure-only, schema-only, or internal refactoring tasks without user-facing impact.
- If an operation's consequence cannot be verified, mark NEEDS BEHAVIOR CONFIRMATION; do not invent behavior.
{END}"""


def merge_instructions(original: str, agent: str) -> str:
    block = instruction_block(agent)
    if (BEGIN in original) != (END in original):
        raise ValueError("Found incomplete managed instruction markers.")
    if BEGIN in original:
        if original.count(BEGIN) != 1 or original.count(END) != 1:
            raise ValueError("Found duplicate managed instruction markers.")
        before, rest = original.split(BEGIN, 1)
        _, after = rest.split(END, 1)
        return before + block + after
    return original.rstrip("\n") + ("\n\n" if original.strip() else "") + block + "\n"


def install_file(source: Path, dest: Path, *, dry_run: bool, update: bool, notices: list[str]) -> None:
    if dest.is_symlink():
        notices.append(f"SKIPPED symlink: {dest}")
        return
    if dest.is_file():
        if dest.read_bytes() == source.read_bytes():
            notices.append(f"UNCHANGED: {dest}")
            return
        if not update:
            notices.append(f"SKIPPED modified skill file (use --update): {dest}")
            return
    if dry_run:
        notices.append(f"WOULD INSTALL: {dest}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
    notices.append(f"INSTALLED: {dest}")


def install_instructions(dest: Path, agent: str, *, dry_run: bool, notices: list[str]) -> None:
    if dest.is_symlink():
        notices.append(f"SKIPPED symlink: {dest}")
        return
    original = dest.read_text(encoding="utf-8") if dest.exists() else ""
    updated = merge_instructions(original, agent)
    if original == updated:
        notices.append(f"UNCHANGED: {dest}")
        return
    if dry_run:
        notices.append(f"WOULD UPDATE: {dest}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(updated, encoding="utf-8")
    notices.append(f"UPDATED: {dest}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--project", metavar="REPO", type=Path, help="Install into repository (default: current directory)")
    modes.add_argument("--global", dest="global_install", action="store_true", help="Install to user's Codex and/or Claude Code folders")
    parser.add_argument("--agent", choices=("both", "codex", "claude"), default="both")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--update", action="store_true", help="Replace differing skill files, retaining unrelated files")
    args = parser.parse_args()

    for path in SKILL_FILES:
        if not (SOURCE / path).is_file():
            parser.error(f"Missing skill file: {SOURCE / path}")

    agents = ("codex", "claude") if args.agent == "both" else (args.agent,)
    target = Path.home() if args.global_install else (args.project or Path.cwd()).expanduser().resolve()
    if not args.global_install and not target.is_dir():
        parser.error(f"Project directory does not exist: {target}")

    notices: list[str] = []
    for agent in agents:
        if args.global_install:
            agent_root = target / (".codex" if agent == "codex" else ".claude")
            skill_dir = agent_root / "skills" / SKILL_NAME
            instructions = agent_root / ("AGENTS.md" if agent == "codex" else "CLAUDE.md")
        else:
            agent_root = target / (".agents" if agent == "codex" else ".claude")
            skill_dir = agent_root / "skills" / SKILL_NAME
            instructions = target / ("AGENTS.md" if agent == "codex" else "CLAUDE.md")
        for relative_path in SKILL_FILES:
            install_file(SOURCE / relative_path, skill_dir / relative_path,
                         dry_run=args.dry_run, update=args.update, notices=notices)
        try:
            install_instructions(instructions, agent, dry_run=args.dry_run, notices=notices)
        except (ValueError, UnicodeDecodeError, IsADirectoryError) as exc:
            notices.append(f"ERROR updating {instructions}: {exc}")
    print("\n".join(notices))
    if any(item.startswith("ERROR ") for item in notices):
        return 1
    if any(item.startswith("SKIPPED") for item in notices):
        print("WARNING: Existing skill files were preserved; review then run with --update if appropriate.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
