# Analysis contract

## Output

`graph.json` and `index.html` contain the same snapshot. Schema version 1 contains `meta`, `nodes`, and `edges`. HTML embeds JSON safely and uses textContent for repository and scanner strings. No external resources or telemetry are used.

Nodes contain `id`, `label`, `kind`; source nodes also contain `file`, `line`, `endLine`, optional `parent`, `signature`, and `excerpt`. Node kinds: module (source file), class, function, method, endpoint, external. Imported findings attach to the narrowest containing source symbol. IDs are deterministic for an unchanged snapshot, but position-based IDs may change after edits.

Edges contain `source`, `target`, `type`, `confidence`, and `evidence` (file and line). Types: contains, imports, calls, constructs, extends, implements, registers handler. Resolved means compiler declaration resolution, never a guarantee about runtime behavior. Endpoint registrations are inferred.

Metadata includes generation timestamp, commit, dirty state, file count, unresolved call count, warnings, findings imported and unmatched. Dirty state describes the working tree before writing output. Reports do not detect changes after generation. Local absolute root is embedded for editor navigation; remove it before distributing a report if sensitive.

## Supported extraction

- JS, JSX, TS, TSX, MJS, CJS, MTS and CTS source files.
- Git tracked plus non-ignored untracked files when Git is available; otherwise directory traversal excludes hidden directories, dependency, vendor, build and coverage folders.
- TypeScript compiler AST and symbols; top-level tsconfig compiler options including path aliases. Monorepo project-specific options are not individually merged.
- Named and anonymous functions, arrow functions, classes, methods, constructors, static imports, resolved call/new expressions and class heritage.
- Express-style `.get/post/put/patch/delete/options/head/all` calls with a literal first argument and at least one handler. Other libraries with the same syntax can produce false-positive candidates. Arrays of middleware, chained route builders and mounted prefixes are not resolved.
- SARIF result physical locations with repository-relative or absolute file URIs; artifact indexes supported. URI base identifiers and scanner-specific remappings are not resolved. Unmatched findings are counted, not discarded silently.

## Limits and extensions

No dynamic import/require edges, runtime traces, full data flow, DB models, resource discovery, vulnerability scanning, automatic source watching or Git diff comparison. Class expressions, accessors and framework decorators require additional adapters. No automatic test-coverage inference. Syntax diagnostics appear as warnings; partial extraction can remain useful.

Extend language/framework adapters separately; emit the same schema with evidence and confidence. Add data-flow or runtime relationships as distinct types with their own evidence. Preserve unresolved counts and avoid guessed name-based joins. Large repositories may need incremental indexing and a virtualized graph renderer; the first version recomputes the snapshot and limits visible nodes.
