'use strict';
module.exports = (current, baseline, metadata) => {
  const before = new Map(baseline.nodes.map(n => [n.id, n])), after = new Map(current.nodes.map(n => [n.id, n]));
  const summary = { added: 0, modified: 0, removed: 0, affected: 0 };
  for (const n of current.nodes) {
    const old = before.get(n.id);
    n.change = !old ? 'added' : n.fingerprint !== old.fingerprint ? 'modified' : 'unchanged';
    if (n.change !== 'unchanged') summary[n.change]++;
  }
  for (const n of baseline.nodes) if (!after.has(n.id)) { current.nodes.push({ ...n, change: 'removed', snapshot: 'base' }); summary.removed++; }
  const edgeKey = e => [e.source, e.target, e.type, e.order, e.scope].join('|');
  const previousEdges = new Map(baseline.edges.map(e => [edgeKey(e), e])), latestEdges = new Map(current.edges.map(e => [edgeKey(e), e]));
  for (const e of current.edges) e.change = previousEdges.has(edgeKey(e)) ? 'unchanged' : 'added';
  for (const [id, e] of previousEdges) if (!latestEdges.has(id)) current.edges.push({ ...e, change: 'removed', snapshot: 'base' });
  // Seed symbols and endpoints, not modified module containers: avoid marking every file importer as affected.
  const changed = new Set(current.nodes.filter(n => !['module', 'external'].includes(n.kind) && n.change !== 'unchanged').map(n => n.id));
  for (const e of current.edges) if (!['contains', 'imports'].includes(e.type) && e.change !== 'unchanged') changed.add(e.source);
  const affected = new Set(changed), incoming = new Map();
  for (const e of current.edges) if (!['contains', 'imports'].includes(e.type)) { if (!incoming.has(e.target)) incoming.set(e.target, []); incoming.get(e.target).push(e.source); }
  const queue = [...changed];
  for (let i = 0; i < queue.length; i++) for (const caller of incoming.get(queue[i]) || []) if (!affected.has(caller)) { affected.add(caller); queue.push(caller); }
  for (const n of current.nodes) { n.affected = affected.has(n.id); if (n.affected && n.change === 'unchanged') summary.affected++; }
  return { ...metadata, summary, baselineWarnings: baseline.warnings, note: 'Potential static impact through current and baseline calls/registrations. Removed nodes use baseline locations. File moves and renames are represented as removal/addition. Repeated anonymous symbols may shift identities.' };
};
