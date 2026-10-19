# Enterprise UX audit scorecard

Use this only for explicitly requested full audits. Scores are heuristic observations, not usability research or compliance certificates.

| Dimension | Weight |
| --- | ---: |
| Workflow efficiency | 20% |
| Information architecture and navigation | 15% |
| Data presentation and interaction | 15% |
| Consistency and design-system reuse | 15% |
| Operational safety and state clarity | 15% |
| Accessibility and inclusiveness | 10% |
| Visual hierarchy and responsiveness | 10% |
| **Total** | **100%** |

Score each dimension 0–5 where evidence supports it: 0 missing or harmful; 1 major blockers; 2 material friction; 3 functional with gaps; 4 effective with limited improvements; 5 strong performance with verified evidence across relevant states.

**Composite:** sum (dimension score / 5 × weight). Round to nearest whole number. If one or more dimensions cannot be evaluated, use NOT ASSESSED and avoid an unsupported overall score.

For each rating, identify the screen/file/task/state supporting it, and distinguish code inspection from a tested interface. Critical safety or accessibility blockers must be identified independently regardless of composite score.

Audit output should cover scope, personas and tasks, evidence limitations, weighted ratings, severity-ranked findings, immediate fixes, structural changes and verification plan.