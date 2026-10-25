# Analysis contract

## Output and evidence

`graph.json` and `index.html` hold schema version 2. The HTML bundles pinned Cytoscape locally and uses textContent for repository/scanner strings. No CDN, telemetry, server or application execution is required. TypeScript and Cytoscape are runtime dependencies; jsdom is used only for development tests.

Nodes contain `id`, `label`, `kind`; source nodes include `file`, `line`, `endLine`, optional `parent`, `signature`, `excerpt`, and a content `fingerprint`. Node kinds: module (source file), class, function, method, endpoint, external. Imported findings attach to the narrowest containing current source symbol. IDs use file path, lexical parent, declaration kind/name and duplicate ordinal; endpoint IDs use file, framework, verb/path and duplicate ordinal.

Edges contain `source`, `target`, `type`, `confidence`, and `evidence` (file, line, endLine, extraction method). Types include contains, imports, calls, constructs, extends, implements, registers handler, registers middleware. Framework edges can include registration `order` and `scope`; these describe syntactic argument/hook order, not proven execution order across middleware or modules.

Endpoint nodes add `framework`, HTTP `method`, `path`, `localPath`, `prefixResolved`, confidence, registration evidence and a note. `resolved` means a static registration or declaration target was identified; it does not prove deployment, execution, reachability, authentication or exploitability.

Metadata includes timestamp, absolute root, commit, working-tree dirty state, file count, unresolved calls, warnings and imported/unmatched finding counts. Dirty state is captured before output writes. Reports do not detect later changes. Local absolute roots and source excerpts can be sensitive when distributing reports.

## Framework coverage

| Adapter | Supported | Unresolved or excluded |
| --- | --- | --- |
| Express | Default/namespace factory, named/namespace Router imports; direct CommonJS factory/destructured Router requires; cross-file router imports; literal use mounts including multiple/nested mounts; method registrations, handler arrays, chained route().get/post; mount middleware and route handler order. | Dynamic path/prefix, complete global use middleware ordering, reassigned receivers, factory wrappers, regex routes, conditional activation and error middleware semantics. Unmounted routers remain inferred. |
| Fastify | Imported factory, method shorthand with direct handler or options/handler, route object with literal method(s)/url, preHandler hooks, register plugins with resolvable function parameter and literal prefix, nested plugin scopes up to 12 discovery passes. | Plugin wrappers (including fastify-plugin prefix semantics), dynamic options, autoload, global hooks, complete encapsulation/lifecycle and registration-time mutation. |
| NestJS | Imported Controller/HTTP method decorator aliases, string/array controller and handler paths, Controller({path}) and links to method bodies. | Module activation, global prefixes, versioning, guards, DI bindings, inherited controllers, computed decorators and RouterModule mounts. Always inferred controller-relative paths. |
| Next.js | A nearest package.json declaring next, app or src/app route.js/ts, named exported HTTP functions/variables and export aliases. Preserves dynamic path notation and omits route groups from paths. | Pages Router, private/parallel/intercepting paths, basePath, rewrites, middleware, generated routes and deployment configuration. Always inferred app-relative paths. |

Do not treat unidentified get/post receivers as generic endpoint candidates. Known framework registrations with nonliteral paths are skipped with notes where supported. Framework identification relies on static imports/bindings and does not evaluate code.

## Source extraction

JS, JSX, TS, TSX, MJS, CJS, MTS and CTS files are eligible. Declaration files and package/tsconfig JSON are read to support resolution/configuration, but declaration-file symbols are not emitted. Git tracked and nonignored untracked files are read; non-Git fallback skips hidden/dependency/build/vendor/coverage directories. Symlinks, outside-root source targets and installed tooling under .agents/.claude/.codex/.repo-map are excluded from current and baseline extraction. Source and config reads use a virtual compiler host. No baseline checkout or application execution occurs.

TypeScript AST/symbols cover functions, classes/class expressions, methods/accessors/constructors, static imports, resolvable calls/new expressions and class heritage. Root tsconfig options and local config extends are read; per-project monorepo compiler configurations are not individually merged. Baseline extraction uses baseline tracked text, with compiler standard libraries from the installed toolchain. Dependencies under repository node_modules are not read by the compiler host, so external type resolution can be incomplete.

No dynamic import/require graph, runtime traces, complete data flow, DB models, automatic test coverage or source watching. Some static and dynamic dispatch remain unresolved. Anonymous or duplicate declarations may have shifting ordinal IDs. Source hashes compare declaration text, including whitespace/comments inside declarations; they do not establish semantic equivalence.

## Git comparison

`--base REVISION` resolves an exact local commit, extracts eligible tracked regular files with Git plumbing and compares them with the current working tree, including nonignored untracked sources. Invalid/missing revisions fail explicitly. No merge-base substitution, checkout, application build or scanner execution occurs.

Node `change`: added, modified, removed, unchanged. Removed nodes contain `snapshot: base`, old excerpt and old location. Edge changes are compared by source/target/type/order/scope. A baseline-only relationship is retained with `change: removed` and `snapshot: base`. Edge line shifts alone do not create changes.

Potential impact traverses incoming calls, registrations and other non-container relationships from changed symbols/endpoints and sources of changed relationships, across the union of baseline/current graphs. Imports and contains edges do not propagate impact. `affected` is not runtime impact, data flow, exploitation, or test coverage. Module content changes are listed but do not automatically taint all importers. Renames/moves appear as removed/added symbols. `comparison` includes base SHA, requested ref, target (working-tree), counts, baseline warnings and limitations.

## SARIF and viewer

SARIF physical locations support repository-relative/absolute file URIs and artifact indexes. Base URI identifiers and scanner-specific mappings are not resolved. Findings attach only to current symbols; unmatched results are counted.

The viewer builds indexed incoming/outgoing/containment maps once. Architecture initially skips single-folder wrapper paths and displays immediate folder/file children, with source-path aggregates and import counts between visible groups. Folder names are source organization, not inferred business domains. Counts can include retained baseline nodes when a comparison exists.

Every catalog and folder listing is paginated at 12 items. Selecting a file/class browses its direct symbols; selecting a function/endpoint opens a focused trace of at most 12 neighbours plus the selected root (six neighbours on narrow screens). Immediate callers and dependencies are balanced up to six each; additional relationships remain accessible in paginated Incoming/Outgoing lists of eight. Parallel edges in a trace are combined into one labelled count; individual source locations remain in these connection lists. These lists also include containment/import evidence. Bounded multi-hop traces do not promise complete reachability coverage. Global search indexes code labels and paths; it displays paged matches rather than putting all matches on the canvas.

The canvas uses explicit readable grid/trace positions, tooltip evidence, clickable nodes, drag/pan/zoom, Back and breadcrumbs. Fit clamps automatic zoom to a readable scale instead of shrinking hundreds of nodes to fit. Small viewports may require panning; the detail pane moves below the graph. A report embeds the navigation model, viewer code and Cytoscape, with no network dependency. The full graph remains available in JSON. This release does not provide incremental source indexing.

## Extension boundary

Keep new language/framework adapters separate, emit extraction method and confidence for every relationship, and preserve unknowns. Add runtime and data-flow relationships as distinct types backed by their own evidence. Security overlays, runtime tracing, additional languages and incremental indexing are future work.
