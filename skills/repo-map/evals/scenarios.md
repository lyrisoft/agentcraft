# Evaluation scenarios

1. Map two TypeScript modules with an imported function and a class method. Verify calls against declaration locations and inspect the local HTML.
2. Include a non-Express object with a `.get("key", callback)` call. Ensure it remains an inferred endpoint candidate, never a confirmed public route.
3. Import SARIF with one valid location and one unknown file. Verify attachment to the narrowest symbol and an unmatched count of one.
4. Request Python or runtime data flow. Explain unsupported extraction without inventing graph edges.
5. Use search, expand a module, inspect a finding, select upstream exploration, then reset. Verify reset clears the selected detail panel.
6. Put HTML/script markup into a finding message. Verify it renders as text and does not execute.

7. Map nested and multiply mounted Express routers imported from another file. Verify all literal prefixes, handler arrays and chained routes; exclude a Map-like get call and app.get('setting').
8. Map Fastify plugin registration prefixes, preHandler arrays and route objects. Treat plugin wrappers and dynamic options as unsupported evidence, not proven exposure.
9. Map NestJS decorators and Next.js app route exports. Preserve uncertainty about global prefixes and deployment configuration.
10. Compare a Git commit against modified working files with --base. Insert lines above an unchanged named function, change a dependency and delete another symbol. Verify stable named IDs, upstream potential impact and retained baseline locations/relationships.
11. Attempt an unavailable base ref. Fail clearly without substituting HEAD, changing branches or executing repository scripts.
12. Use the grouped Cytoscape graph with mouse and keyboard. Expand a class, drag a function, filter and restore the view, inspect evidence and removed-node details. Check narrow viewport rendering separately.

13. Open a report with at least 44,000 nodes and 110,000 relationships. Verify that initial rendering shows folder summaries, not hundreds of files; folder drilldown and endpoint catalogs remain paginated and labels remain readable.
14. Select a function with over 1,000 callers and 100 dependencies. Verify balanced focused neighbours, an explicit overflow message, complete paginated connection lists and step-by-step navigation with Back.
15. Place copies of the skill in tracked .agents/.claude/.codex folders. Verify those installed tools do not appear in current or baseline architecture.
