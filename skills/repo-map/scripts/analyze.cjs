#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const { analyze } = require('./engine.cjs');
function main() {
const args = process.argv.slice(2), opt = {};
if (args.includes('--help')) { console.log('Usage: node analyze.cjs --repo PATH --out PATH [--typescript PATH] [--sarif PATH] [--base REVISION]\nGenerate an offline code graph. --base compares an exact local Git revision against the working tree.'); return; }
for (let i = 0; i < args.length; i++) {
  if (!['--repo', '--out', '--typescript', '--sarif', '--base'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw Error('Usage: node analyze.cjs --repo PATH --out PATH [--typescript PATH] [--sarif PATH] [--base REVISION]');
  opt[args[i].slice(2)] = args[++i];
}
const root = fs.realpathSync(opt.repo || process.cwd()), out = path.resolve(opt.out || path.join(root, '.repo-map'));
let ts;
for (const candidate of [opt.typescript, process.env.REPO_MAP_TYPESCRIPT, path.join(root, 'node_modules/typescript'), 'typescript'].filter(Boolean)) { try { ts = require(candidate); break; } catch {} }
if (!ts) throw Error('TypeScript compiler API missing. Run npm ci --ignore-scripts in the skill folder, or pass --typescript /path/to/typescript.');
const rel = p => path.relative(root, p).split(path.sep).join('/');
const git = (...params) => cp.execFileSync('git', ['-C', root, ...params], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const excluded = p => /(^|\/)(node_modules|dist|build|coverage|vendor|\.git|\.agents|\.claude|\.codex|\.repo-map)(\/|$)/.test(p) || path.resolve(root, p) === out || path.resolve(root, p).startsWith(out + path.sep);
const eligible = p => /\.[cm]?[jt]sx?$/.test(p) || /(^|\/)(package|tsconfig[^/]*)\.json$/.test(p);
let files;
try { files = git('ls-files', '-co', '--exclude-standard', '-z').split('\0').filter(Boolean); }
catch {
  files = [];
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || excluded(rel(path.join(d, e.name)))) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.isFile()) files.push(rel(p)); } };
  walk(root);
}
const texts = new Map();
for (const file of [...new Set(files)].sort()) {
  const full = path.resolve(root, file);
  if (!eligible(file) || excluded(file) || !fs.existsSync(full) || fs.lstatSync(full).isSymbolicLink() || !fs.realpathSync(full).startsWith(root + path.sep)) continue;
  texts.set(full, fs.readFileSync(full, 'utf8'));
}
const current = analyze(ts, root, texts);
let commit = null, dirty = null;
try { commit = git('rev-parse', 'HEAD').trim(); dirty = !!git('status', '--porcelain', '--untracked-files=normal').trim(); } catch {}
let comparison = null;
if (opt.base) {
  let base;
  try { base = git('rev-parse', '--verify', '--end-of-options', opt.base + '^{commit}').trim(); }
  catch { throw Error('Could not resolve --base to a local Git commit. Fetch the revision first.'); }
  const baselineTexts = new Map();
  for (const entry of git('ls-tree', '-r', '-z', base).split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t'), file = entry.slice(tab + 1);
    if (!entry.startsWith('100') || !eligible(file) || excluded(file)) continue;
    baselineTexts.set(path.join(root, file), git('show', base + ':' + file));
  }
  const baseline = analyze(ts, root, baselineTexts);
  comparison = require('./impact.cjs')(current, baseline, { base, requestedBase: opt.base, target: 'working-tree' });
}
let findingCount = 0, unmatched = 0;
if (opt.sarif) {
  const sarif = JSON.parse(fs.readFileSync(opt.sarif, 'utf8'));
  for (const run of sarif.runs || []) for (const result of run.results || []) {
    let matched = false;
    for (const loc of result.locations || []) {
      const physical = loc.physicalLocation, art = physical?.artifactLocation;
      let uri = art?.uri ?? run.artifacts?.[art?.index]?.location?.uri;
      if (!uri) continue;
      try { if (uri.startsWith('file://')) uri = require('node:url').fileURLToPath(uri); else uri = decodeURIComponent(uri); } catch { continue; }
      const file = rel(path.resolve(root, uri)), line = physical.region?.startLine || 1;
      const targets = current.nodes.filter(n => n.change !== 'removed' && n.file === file && n.line <= line && n.endLine >= line && n.kind !== 'endpoint').sort((a, b) => (a.endLine - a.line) - (b.endLine - b.line));
      if (targets.length) {
        const rule = (run.tool?.driver?.rules || []).find(r => r.id === result.ruleId);
        (targets[0].findings ??= []).push({ rule: result.ruleId || 'unspecified', level: result.level || rule?.defaultConfiguration?.level || 'warning', message: result.message?.text || result.message?.markdown || '', file, line, scanner: run.tool?.driver?.name || 'unknown', status: 'imported; not independently verified' });
        matched = true;
      }
    }
    findingCount++; if (!matched) unmatched++;
  }
}
current.warnings.push('Static relationships and framework registrations do not establish runtime reachability, authorization or exploitability.');
const data = { schemaVersion: 2, meta: { name: path.basename(root), localRoot: root, generatedAt: new Date().toISOString(), commit, dirty, files: current.files, unresolvedCalls: current.unresolvedCalls, findingsImported: findingCount, findingsUnmatched: unmatched, warnings: current.warnings }, nodes: current.nodes, edges: current.edges, comparison };
// The HTML is fully offline. Embed the pinned renderer rather than loading code from a CDN.
let renderer;
try { renderer = fs.readFileSync(require.resolve('cytoscape/dist/cytoscape.min.js'), 'utf8'); }
catch { throw Error('Cytoscape is missing. Run npm ci --ignore-scripts in the skill folder.'); }
const safe = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const template = fs.readFileSync(path.join(__dirname, '../assets/viewer.html'), 'utf8');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'graph.json'), JSON.stringify(data, null, 2));
fs.writeFileSync(path.join(out, 'index.html'), template.replace('/*CYTOSCAPE*/', () => renderer.replace(/<\/script/gi, '<\\/script')).replace('/*NAVIGATION*/', () => fs.readFileSync(path.join(__dirname, '../assets/navigation.js'), 'utf8')).replace('/*VIEWER*/', () => fs.readFileSync(path.join(__dirname, '../assets/viewer.js'), 'utf8')).replace('/*GRAPH_DATA*/', () => safe));
console.log(JSON.stringify({ output: out, nodes: data.nodes.length, edges: data.edges.length, comparison: comparison?.summary, ...data.meta }, null, 2));

}
try { main(); } catch (error) { console.error('repo-map: ' + error.message); process.exitCode = 1; }
