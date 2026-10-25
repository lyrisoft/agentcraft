/* Shared, indexed navigation model. No UI or repository execution. */
(function (global) {
  'use strict';
  function createNavigation(graph) {
    const byId = new Map(graph.nodes.map(n => [n.id, n]));
    const incoming = new Map(), outgoing = new Map(), members = new Map(), folders = new Map(), folderIds = new Map();
    const folder = path => {
      if (!folders.has(path)) folders.set(path, { id: 'folder:' + path, path, kind: 'folder', label: path.split('/').pop() || graph.meta.name, files: 0, symbols: 0, endpoints: 0, findings: 0, changes: 0, affected: 0, children: new Set() });
      const result = folders.get(path); folderIds.set(result.id, result); return result;
    };
    folder('');
    for (const n of graph.nodes) {
      if (n.parent) { if (!members.has(n.parent)) members.set(n.parent, []); members.get(n.parent).push(n.id); }
      if (!n.file) continue;
      const dirs = n.file.split('/'); dirs.pop();
      const chain = ['']; for (let i = 1; i <= dirs.length; i++) chain.push(dirs.slice(0, i).join('/'));
      chain.forEach((p, i) => { const f = folder(p); if (i) folder(chain[i - 1]).children.add(f.id); if (n.kind === 'module') f.files++; else if (n.kind === 'endpoint') f.endpoints++; else f.symbols++; f.findings += n.findings?.length || 0; f.changes += n.change && n.change !== 'unchanged' ? 1 : 0; f.affected += n.affected ? 1 : 0; });
      if (n.kind === 'module') folder(chain.at(-1)).children.add(n.id);
    }
    for (const e of graph.edges) {
      if (!outgoing.has(e.source)) outgoing.set(e.source, []);
      if (!incoming.has(e.target)) incoming.set(e.target, []);
      outgoing.get(e.source).push(e); incoming.get(e.target).push(e);
    }
    const scopeMatch = (n, scope) => !scope || n.file?.startsWith(scope + '/') || n.file === scope;
    const collator = new Intl.Collator(undefined, {numeric:true,sensitivity:'base'});
    const rank = n => (n.kind === 'endpoint' ? 0 : n.kind === 'folder' ? 1 : n.kind === 'module' ? 2 : n.kind === 'class' ? 3 : 4);
    const sort = (a, b) => rank(a) - rank(b) || collator.compare(a.label,b.label) || a.id.localeCompare(b.id);
    const get = id => byId.get(id) || folderIds.get(id);
    function children(scope = '') { return [...(folder(scope).children || [])].map(get).filter(Boolean).sort(sort); }
    function bucket(id, scope) {
      const file = byId.get(id)?.file;
      if (!file || !scopeMatch({ file }, scope)) return null;
      const rest = scope ? file.slice(scope.length + 1) : file;
      return rest.includes('/') ? 'folder:' + (scope ? scope + '/' : '') + rest.split('/')[0] : 'file:' + file;
    }
    function aggregateEdges(scope, visible) {
      const ids = new Set(visible), groups = new Map();
      for (const e of graph.edges) {
        if (e.type !== 'imports') continue;
        const source = bucket(e.source, scope), target = bucket(e.target, scope);
        if (!source || !target || source === target || !ids.has(source) || !ids.has(target)) continue;
        const key = source + '\0' + target;
        if (!groups.has(key)) groups.set(key, { source, target, type: 'imports', confidence: 'resolved', count: 0 });
        groups.get(key).count++;
      }
      return [...groups.values()].sort((a, b) => b.count - a.count);
    }
    function catalog({ mode = 'endpoints', query = '', scope = '', owner = null } = {}) {
      const q = query.toLowerCase().trim();
      let candidates = owner ? (members.get(owner) || []).map(id => byId.get(id)) : graph.nodes;
      return candidates.filter(n => {
        if (!scopeMatch(n, scope)) return false;
        if (q && !(n.label + ' ' + (n.file || '')).toLowerCase().includes(q)) return false;
        if (owner) return true;
        if (mode === 'endpoints') return n.kind === 'endpoint';
        if (mode === 'security') return !!n.findings?.length;
        if (mode === 'impact') return !!n.change && (n.change !== 'unchanged' || n.affected);
        if (mode === 'symbols') return ['class', 'function', 'method'].includes(n.kind);
        return n.kind !== 'external';
      }).sort(sort);
    }
    function relations(id, direction) { return (direction === 'incoming' ? incoming : outgoing).get(id) || []; }
    const semantic = e => !['contains', 'imports'].includes(e.type);
    function focused(id, direction = 'both', depth = 1, limit = 12) {
      const ids = new Set([id]); let frontier = [id]; const all = new Set();
      for (let hop = 0; hop < depth; hop++) {
        const candidates = [], inCandidates = [], outCandidates = [];
        for (const root of frontier) {
          if (direction !== 'downstream') for (const e of relations(root, 'incoming').filter(semantic)) { all.add(e.source); if (!ids.has(e.source)) inCandidates.push(e.source); }
          if (direction !== 'upstream') for (const e of relations(root, 'outgoing').filter(semantic)) { all.add(e.target); if (!ids.has(e.target)) outCandidates.push(e.target); }
        }
        const ordered = ids => [...new Set(ids)].map(id => byId.get(id)).filter(Boolean).sort(sort);
        const ins = ordered(inCandidates).slice(0, 6), outs = ordered(outCandidates).slice(0, 6);
        for (let i = 0; i < Math.max(ins.length, outs.length); i++) { if (ins[i]) candidates.push(ins[i]); if (outs[i]) candidates.push(outs[i]); }
        const sorted = candidates;
        frontier = [];
        for (const n of sorted) if (ids.size <= limit) { ids.add(n.id); frontier.push(n.id); }
        if (!frontier.length) break;
      }
      const parallel = new Map();
      for (const e of [...ids].flatMap(id => relations(id, 'outgoing')).filter(e => semantic(e) && ids.has(e.target))) { const key=[e.source,e.target,e.type,e.confidence,e.change].join('|');if(!parallel.has(key))parallel.set(key,{...e,count:0});parallel.get(key).count++; }
      const edges = [...parallel.values()];
      return { nodes: [...ids].map(id => byId.get(id)).filter(Boolean), edges, hidden: [...all].filter(x => !ids.has(x)).length };
    }
    function initialScope() { let path=''; for (;;) { const items=children(path); if(items.length!==1||items[0].kind!=='folder')return path; path=items[0].path; } }
    return { byId, incoming, outgoing, folders, members, initialScope, get, children, aggregateEdges, catalog, focused, relations, sort };
  }
  const api = { createNavigation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.RepoMapNavigation = api;
})(globalThis);
