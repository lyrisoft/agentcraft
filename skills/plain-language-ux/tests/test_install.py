"""Smoke tests: python3 -m unittest discover -s tests -v"""
from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INSTALLER = ROOT / "scripts" / "install.py"


class InstallerTests(unittest.TestCase):
    def run_installer(self, directory: Path, *flags: str):
        return subprocess.run(
            [sys.executable, str(INSTALLER), "--project", str(directory), *flags],
            text=True, capture_output=True, check=True,
        )

    def test_preserves_existing_instructions(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "AGENTS.md").write_text("Never force push.\n")
            (root / "CLAUDE.md").write_text("Use pnpm.\n")
            self.run_installer(root)
            self.assertIn("Never force push.", (root / "AGENTS.md").read_text())
            self.assertIn("Use pnpm.", (root / "CLAUDE.md").read_text())
            self.assertIn("$plain-language-ux", (root / "AGENTS.md").read_text())
            self.assertIn("/plain-language-ux", (root / "CLAUDE.md").read_text())
            for agent_dir in (".agents", ".claude"):
                self.assertTrue((root / agent_dir / "skills" / "plain-language-ux" / "SKILL.md").exists())
                self.assertTrue((root / agent_dir / "skills" / "plain-language-ux" / "references" / "word-choice.md").exists())

    def test_idempotency(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.run_installer(root)
            originals = [(root / name).read_text() for name in ("AGENTS.md", "CLAUDE.md")]
            self.run_installer(root)
            self.assertEqual(originals, [(root / name).read_text() for name in ("AGENTS.md", "CLAUDE.md")])
            self.assertEqual((root / "AGENTS.md").read_text().count("<!-- plain-language-ux:begin -->"), 1)

    def test_dry_run_does_not_modify(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.run_installer(root, "--dry-run")
            self.assertEqual(list(root.iterdir()), [])

    def test_modified_skill_preserved_until_update(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.run_installer(root)
            target = root / ".agents" / "skills" / "plain-language-ux" / "SKILL.md"
            target.write_text("custom changes")
            self.run_installer(root)
            self.assertEqual(target.read_text(), "custom changes")
            self.run_installer(root, "--update")
            self.assertEqual(target.read_text(), (ROOT / "SKILL.md").read_text())


if __name__ == "__main__":
    unittest.main()
