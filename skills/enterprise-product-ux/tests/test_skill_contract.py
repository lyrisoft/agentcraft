"""Portable contract tests."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"

class SkillContractTests(unittest.TestCase):
    def test_metadata(self):
        s = SKILL.read_text()
        self.assertTrue(s.startswith("---\n"))
        self.assertIn("name: enterprise-product-ux", s)
        self.assertIn("description:", s)

    def test_references(self):
        s = SKILL.read_text()
        for p in set(re.findall(r"references/[a-z-]+\.md", s)):
            self.assertTrue((ROOT / p).exists(), p)

    def test_guardrails(self):
        s = SKILL.read_text().lower()
        for p in ("accessibility", "backend-only", "explicit", "permissions", "review"):
            self.assertIn(p, s)

    def test_scorecard(self):
        s = (ROOT / "references/scorecard.md").read_text()
        prefix = s.split("**Total**")[0]
        self.assertEqual(sum(map(int, re.findall(r"\|\s*(\d+)%\s*\|", prefix))), 100)

    def test_eval_coverage(self):
        s = (ROOT / "evals/scenarios.md").read_text()
        self.assertGreaterEqual(len(re.findall(r"(?m)^\d+\.", s)), 20)

    def test_install_docs(self):
        self.assertIn("npx skills add lyrisoft/agentcraft", (ROOT / "README.md").read_text())

if __name__ == "__main__":
    unittest.main()
