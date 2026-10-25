# Evaluation scenarios

1. Map two TypeScript modules with an imported function and a class method. Verify calls against declaration locations and inspect the local HTML.
2. Include a non-Express object with a `.get("key", callback)` call. Ensure it remains an inferred endpoint candidate, never a confirmed public route.
3. Import SARIF with one valid location and one unknown file. Verify attachment to the narrowest symbol and an unmatched count of one.
4. Request Python or runtime data flow. Explain unsupported extraction without inventing graph edges.
5. Use search, expand a module, inspect a finding, select upstream exploration, then reset. Verify reset clears the selected detail panel.
6. Put HTML/script markup into a finding message. Verify it renders as text and does not execute.
