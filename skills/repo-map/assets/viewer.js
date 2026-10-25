const $ = id => document.getElementById(id);
const nav = RepoMapNavigation.createNavigation(graph);
const PAGE = 12;
let scope = nav.initialScope(), owner = null, selected = null, page = 0, searchTimer;
const relationPages = { Incoming: 0, Outgoing: 0 }, positions = new Map();
const history = [];
function remember() { history.push({scope,owner,selected,page,mode:$('mode').value,query:$('search').value,relations:{...relationPages},detailScroll:$('detail').scrollTop}); $('back').disabled=false; }
let currentView = { nodes: [], edges: [] };
const headless = !!globalThis.__REPO_MAP_HEADLESS__;
const colors = { folder: '#3977df', module: '#6681a7', class: '#8956d8', function: '#169b91', method: '#169b91', endpoint: '#cf8b22', external: '#8794a8' };
const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
const labelFor = n => n.kind==='module' ? (n.file||n.label).split('/').at(-1) : n.label;
function action(text, fn, cls) { const n = el('button', text, cls); n.onclick = fn; return n; }
function fit() {
  if (cy.nodes().empty()) return;
  cy.resize(); cy.fit(undefined, 50);
  if (cy.zoom() < .72) { cy.zoom(.72); cy.center(selected && cy.getElementById(selected).length ? cy.getElementById(selected) : cy.elements()); }
  if (cy.zoom() > 1.15) { cy.zoom(1.15); cy.center(); }
}
const cy = cytoscape({ container: headless ? undefined : $('graph'), headless, styleEnabled: !headless, elements: [], wheelSensitivity: .2, minZoom: .4, maxZoom: 2.5, style: [
  { selector: 'node', style: { label: 'data(display)', shape: 'round-rectangle', width: 196, height: 72, 'background-color': '#fff', 'border-color': 'data(color)', 'border-width': 1.8, 'font-size': 14, color: '#26364c', 'text-valign': 'center', 'text-wrap': 'wrap', 'text-max-width': 178 } },
  { selector: 'node[kind = "folder"]', style: { 'background-color': '#f0f5ff', 'border-width': 2 } },
  { selector: 'edge', style: { width: 1.5, 'line-color': '#a8b9d0', 'target-arrow-color': '#a8b9d0', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', label: 'data(edgeLabel)', 'font-size': 11, 'text-background-color': '#f5f7fb', 'text-background-opacity': 1, 'text-background-padding': 3 } },
  { selector: 'edge[confidence = "inferred"]', style: { 'line-style': 'dashed' } },
  { selector: 'node[change = "added"]', style: { 'border-color': '#18865b', 'background-color': '#e7f8ee' } },
  { selector: 'node[change = "modified"]', style: { 'border-color': '#d3921c', 'background-color': '#fff7df' } },
  { selector: 'node[change = "removed"]', style: { 'border-color': '#db5068', 'border-style': 'dashed', 'background-color': '#ffeff2' } },
  { selector: 'edge[change = "removed"]', style: { 'line-color': '#db5068', 'line-style': 'dashed' } },
  { selector: 'node[hasFinding = 1]', style: { 'border-color': '#e44862', 'border-width': 3 } },
  { selector: 'node.selected', style: { 'background-color': '#1c65dc', color: '#fff', 'border-color': '#114ca9', 'border-width': 3 } }
] });
$('subtitle').textContent = graph.meta.name + ' · ' + (graph.meta.commit?.slice(0, 8) || 'unversioned') + (graph.meta.dirty ? ' · working tree modified' : '');
$('summary').textContent = `${graph.meta.files.toLocaleString()} files · ${graph.nodes.length.toLocaleString()} indexed nodes`;
$('footer').textContent = 'Snapshot ' + new Date(graph.meta.generatedAt).toLocaleString() + ' · Source-backed static relationships · Re-run after source changes';
$('status').textContent = `${graph.meta.unresolvedCalls} unresolved calls. ${graph.meta.findingsImported} imported findings; ${graph.meta.findingsUnmatched} unmatched.`;
for (const w of graph.meta.warnings) $('warnings').append(el('p', w));
if (graph.comparison) { const s = graph.comparison.summary; $('comparison').textContent = `Compared with ${graph.comparison.base.slice(0, 8)}: ${s.added} added, ${s.modified} modified, ${s.removed} removed, ${s.affected} potentially affected. Open Changes & impact to inspect.`; }
else { $('mode').querySelector('[value="impact"]').disabled = true; $('comparison').textContent = 'Generate with --base main to enable change impact.'; }
function paginate(container, total, index, size, change) {
  container.replaceChildren(); const pages = Math.max(1, Math.ceil(total / size));
  const prev = action('Previous', () => change(index - 1)); prev.disabled = index === 0;
  const next = action('Next', () => change(index + 1)); next.disabled = index + 1 >= pages;
  container.append(prev, el('small', `${index + 1} / ${pages}`), next);
}
function openScope(path, record = true) { if(record)remember(); scope = path; owner = null; selected = null; page = 0; $('search').value = ''; $('mode').value = 'overview'; render(); if(path)details(nav.folders.get(path));else $('detail').replaceChildren(el('h2','Start with a folder or endpoint'),el('p','Open a folder to browse files, or choose Endpoints to trace a request handler.')); }
function openMembers(id, record = true) { if(record)remember(); const file=nav.get(id)?.file;if(file)scope=file.split('/').slice(0,-1).join('/'); owner = id; selected = id; page = 0; $('search').value = ''; $('mode').value = 'overview'; render(); details(nav.get(id)); }
function choose(id) {
  const n = nav.get(id); if (!n) return; remember();
  if (n.kind === 'folder') { openScope(n.path, false); details(n); return; }
  if (n.kind === 'module') { openMembers(id, false); return; }
  selected = id; if(n.file)scope=n.file.split('/').slice(0,-1).join('/'); owner = null; page = 0; $('search').value = ''; $('mode').value = 'focus'; relationPages.Incoming = relationPages.Outgoing = 0; render(); details(n);
}
function breadcrumbs() {
  const box = $('breadcrumbs'); box.replaceChildren(action(graph.meta.name, () => openScope('')));
  const paths = scope.split('/').filter(Boolean); paths.forEach((name, i) => box.append(el('span', '/'), action(name, () => openScope(paths.slice(0, i + 1).join('/')))));
  if (owner) box.append(el('span', '/'), el('span', nav.get(owner) ? labelFor(nav.get(owner)) : 'Symbols'));
  if (selected && !owner) box.append(el('span', '/'), el('span', nav.get(selected)?.label || 'Selected code'));
}
function draw(nodes, edges, focusId = null) {
  const elements = [], ids = new Set(nodes.map(n => n.id));
  const incomingIds = new Set(focusId ? nav.relations(focusId, 'incoming').map(e => e.source) : []);
  const left = nodes.filter(n => n.id !== focusId && incomingIds.has(n.id));
  const right = nodes.filter(n => n.id !== focusId && !incomingIds.has(n.id));
  const columns = Math.max(1, Math.ceil(Math.sqrt(nodes.length * 1.3)));
  nodes.forEach((n, i) => {
    let p;
    if (focusId) { const side = incomingIds.has(n.id) ? left : right, index = side.findIndex(x => x.id === n.id); p = n.id === focusId ? { x: 440, y: 340 } : { x: side === left ? 120 : 760, y: 340 + (index - (side.length - 1) / 2) * 104 }; }
    else p = { x: (i % columns) * 250, y: Math.floor(i / columns) * 120 };
    const cached = positions.get((focusId || 'browse:' + scope + ':' + owner) + ':' + n.id);
    const label=labelFor(n);const short = label.length > 30 ? label.slice(0, 28) + '…' : label;
    const summary = n.kind === 'folder' ? `${n.files} files · ${n.endpoints} endpoints` : n.kind === 'module' ? `${(nav.members.get(n.id) || []).length} symbols` : n.kind;
    elements.push({ group: 'nodes', position: cached || p, data: { ...n, parent: undefined, display: short + '\n' + summary, color: colors[n.kind], hasFinding: n.findings?.length ? 1 : 0 } });
  });
  for (const [i, e] of edges.entries()) if (ids.has(e.source) && ids.has(e.target)) elements.push({ group: 'edges', data: { ...e, id: 'view-edge:' + i, edgeLabel: e.type==='imports' ? e.count+' imports' : e.count>1 ? e.type+' ×'+e.count : e.type } });
  cy.elements().remove(); cy.add(elements); if (focusId) cy.getElementById(focusId).addClass('selected'); cy.layout({ name: 'preset', fit: false }).run(); fit();
}
function render() {
  const mode = $('mode').value, q = $('search').value.trim(), tracing = !q && ['focus', 'upstream', 'downstream'].includes(mode) && selected;
  $('depth-control').style.display = tracing ? 'block' : 'none'; breadcrumbs();
  let list, edges = [], hidden = 0;
  if (tracing) { const view = nav.focused(selected, mode === 'focus' ? 'both' : mode, +$('hops').value, !headless && $('canvas').clientWidth < 700 ? 6 : 12); list = view.nodes; edges = view.edges; hidden = view.hidden; }
  else if (!q && mode === 'overview' && !owner) list = nav.children(scope);
  else list = nav.catalog({ mode: ['focus', 'upstream', 'downstream', 'overview'].includes(mode) ? 'all' : mode, query: q, scope: q ? '' : scope, owner: q ? null : owner });
  const total = list.length; page = Math.min(page, Math.max(0, Math.ceil(total / PAGE) - 1));
  const slice = tracing ? list : list.slice(page * PAGE, (page + 1) * PAGE);
  if (!tracing && !q && mode === 'overview' && !owner) edges = nav.aggregateEdges(scope, slice.map(n => n.id));
  currentView = { nodes: slice, edges, hidden }; draw(slice, edges, tracing ? selected : null);
  $('results').replaceChildren(); $('catalog-count').textContent = tracing ? `${slice.length} nodes in this trace` : `${total.toLocaleString()} ${q ? 'search results' : owner ? 'symbols' : mode === 'overview' ? 'folders / files' : 'results'}`;
  for (const n of slice) {
    const b = action(labelFor(n), () => choose(n.id), 'link');
    b.append(el('small', n.kind === 'folder' ? `${n.files} files · ${n.endpoints} endpoints · ${n.findings} findings` : `${n.file || n.kind}${n.line ? ':' + n.line : ''}`)); $('results').append(b);
  }
  $('pagination').style.display = tracing || total <= PAGE ? 'none' : 'flex'; paginate($('pagination'), total, page, PAGE, p => { page = p; render(); });
  $('empty').textContent = !slice.length ? tracing ? 'No resolved connections. Inspect the source details and analysis notes.' : 'No results in this view. Try another category or search the repository.' : '';
  $('view-title').textContent = tracing ? nav.get(selected).label : q ? 'Search results' : owner ? labelFor(nav.get(owner)) : mode === 'overview' ? scope || 'Repository architecture' : $('mode').selectedOptions[0].textContent;
  $('view-description').textContent = tracing ? `Focused static relationships · ${mode === 'upstream' ? 'Callers' : mode === 'downstream' ? 'Dependencies' : 'Callers and dependencies'} · ${$('hops').value} hop(s)` : mode === 'overview' && !owner && !q ? 'Open a folder to drill down. Arrows summarize imports between the visible folders and files.' : `Showing ${total ? page * PAGE + 1 : 0}–${Math.min((page + 1) * PAGE, total)} of ${total.toLocaleString()}. Select a symbol or endpoint to trace its connections.`;
  $('hint').textContent = hidden ? `${hidden} additional connections available in the Incoming / Outgoing lists. Select a connection to continue the trace.` : 'Click a node to explore · Hover for details · Drag nodes to arrange · Scroll to zoom';
}
function details(n) {
  const box = $('detail'); box.replaceChildren(el('h2', labelFor(n)), el('span', n.kind, 'badge'));
  for (const text of [n.framework, n.confidence, n.change, n.affected ? 'potentially affected' : '']) if (text) box.append(el('span', text, 'badge'));
  if (n.kind === 'folder') { box.append(el('p', `${n.files} source files, ${n.symbols} symbols, ${n.endpoints} endpoints and ${n.findings} imported findings in ${n.path || 'this repository'}.`), action('Open folder', () => openScope(n.path))); return; }
  if (n.file) {
    box.append(el('p', `${n.file}:${n.line}`));
    if (n.change === 'removed') box.append(el('p', 'Baseline source: this code was removed.'));
    else { const a = el('a', 'Open source in VS Code'); a.href = 'vscode://file' + (graph.meta.localRoot + '/' + n.file).split('/').map(encodeURIComponent).join('/') + ':' + n.line; box.append(a); }
  }
  if (['module', 'class'].includes(n.kind)) box.append(el('p'), action('Browse contents', () => openMembers(n.id)));
  if (n.kind !== 'module') box.append(el('p'), action('Trace connections', () => { selected = n.id; owner = null; $('mode').value = 'focus'; $('search').value = ''; page = 0; render(); }));
  if (n.excerpt || n.signature) box.append(el('pre', n.excerpt || n.signature)); if (n.note) box.append(el('p', n.note));
  for (const m of n.registrationEvidence || []) box.append(el('p', `Mounted at ${m.file}:${m.line}`));
  for (const f of n.findings || []) { const block = el('div', undefined, 'finding'); block.append(el('strong', `${f.rule} · ${f.level}`), el('p', f.message), el('small', `${f.scanner} · ${f.file}:${f.line} · ${f.status}`)); box.append(block); }
  for (const direction of ['Incoming', 'Outgoing']) {
    const rows = nav.relations(n.id, direction.toLowerCase()).slice().sort((a, b) => (a.type === 'contains') - (b.type === 'contains'));
    box.append(el('h3', `${direction} (${rows.length})`));
    const region = el('div'), pager = el('div', undefined, 'pager'); box.append(region, pager);
    const update = p => { relationPages[direction] = p; region.replaceChildren(); for (const e of rows.slice(p * 8, (p + 1) * 8)) { const other = nav.get(e.source === n.id ? e.target : e.source); if (!other) continue; const b = action(`${e.type} · ${other.label}${e.change === 'removed' ? ' (baseline)' : ''}`, () => choose(other.id), 'link'); b.title = `${e.confidence} · ${e.evidence?.file || ''}:${e.evidence?.line || ''}`; region.append(b); } if (!rows.length) region.append(el('small', 'No resolved relationships.')); paginate(pager, rows.length, p, 8, update); pager.style.display = rows.length > 8 ? 'flex' : 'none'; };
    update(Math.min(relationPages[direction], Math.max(0, Math.ceil(rows.length / 8) - 1)));
  }
}
cy.on('tap', 'node', e => choose(e.target.id()));
cy.on('dragfree', 'node', e => positions.set((['focus', 'upstream', 'downstream'].includes($('mode').value) ? selected : 'browse:' + scope + ':' + owner) + ':' + e.target.id(), e.target.position()));
cy.on('mouseover', 'node, edge', e => { const n = e.target.data(); $('tooltip').textContent = n.kind ? [n.label, n.kind === 'folder' ? `${n.files} files · ${n.endpoints} endpoints` : `${n.file || ''}:${n.line || ''}`, n.signature || ''].join('\n') : n.count>1 ? `${n.count} ${n.type==='imports'?'static imports between these source groups':'source locations for '+n.type}` : `${n.type} · ${n.confidence}\n${n.evidence?.file || ''}:${n.evidence?.line || ''}`; $('tooltip').style.display = 'block'; });
cy.on('mousemove', 'node, edge', e => { const p = e.originalEvent || {}; $('tooltip').style.left = Math.max(8, Math.min((p.clientX || 20) + 15, innerWidth - 370)) + 'px'; $('tooltip').style.top = Math.max(8, Math.min((p.clientY || 20) + 15, innerHeight - 170)) + 'px'; });
cy.on('mouseout', 'node, edge', () => { $('tooltip').style.display = 'none'; });
$('search').oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page = 0; render(); }, headless ? 0 : 180); };
$('mode').onchange = () => { owner = null; page = 0; render(); };
$('hops').onchange = render; $('fit').onclick = fit; $('plus').onclick = () => cy.zoom(cy.zoom() * 1.2); $('minus').onclick = () => cy.zoom(cy.zoom() / 1.2);
$('back').onclick = () => { const previous=history.pop();if(!previous)return;({scope,owner,selected,page}=previous);Object.assign(relationPages,previous.relations);$('mode').value=previous.mode;$('search').value=previous.query;render();if(selected)details(nav.get(selected));else if(scope)details(nav.folders.get(scope));else $('detail').replaceChildren(el('h2','Start with a folder or endpoint'));$('detail').scrollTop=previous.detailScroll||0;$('back').disabled=!history.length; };
$('reset').onclick = () => { openScope('', false);history.length=0;$('back').disabled=true; $('detail').replaceChildren(el('h2', 'Start with a folder or endpoint'), el('p', 'Open folders to drill down, or select Endpoints to trace a request handler.')); };
render();
if (!headless && globalThis.ResizeObserver) { let timer; new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(() => { if(selected&&['focus','upstream','downstream'].includes($('mode').value))render();else fit(); }, 100); }).observe($('graph')); }
