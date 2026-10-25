'use strict';
const path = require('node:path');
module.exports = ctx => {
  const { ts, root, texts, sourceFiles, astIds, nodeMap, add, unique, edge, location, hash, resolveExpr, imported, literal, strings, value, walk, symbolId, warnings } = ctx;
  const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all']);
  const nextMethod = name => typeof name === 'string' && name !== 'ALL' && methods.has(name.toLowerCase()) && name === name.toUpperCase();
  const join = (...parts) => '/' + parts.filter(Boolean).map(p => p.replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
  const servers = new Map(), registrations = [], mounts = [];
  const key = n => resolveExpr(n);
  const get = n => servers.get(key(n));
  const flatten = n => n && ts.isArrayLiteralExpression(n) ? n.elements.flatMap(flatten) : n ? [n] : [];
  function receiver(n) {
    let item = get(n);
    if (item) return { server: item };
    // Express chained `router.route('/x').get(...).post(...)`.
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
      const previous = receiver(n.expression.expression);
      if (previous?.server.framework === 'express') {
        if (n.expression.name.text === 'route') return { ...previous, routePath: literal(n.arguments[0]) };
        if (methods.has(n.expression.name.text)) return previous;
      }
    }
  }
  for (const sf of sourceFiles) walk(sf, n => {
    if (!ts.isCallExpression(n)) return;
    const fn = n.expression;
    let framework, isRoot = false;
    if (imported(fn, 'express')) { framework = 'express'; isRoot = true; }
    if (imported(fn, 'express', 'Router') || (ts.isPropertyAccessExpression(fn) && fn.name.text === 'Router' && imported(fn.expression, 'express'))) framework = 'express';
    if (imported(fn, 'fastify') || imported(fn, 'fastify', 'fastify')) { framework = 'fastify'; isRoot = true; }
    if (framework) servers.set(n, { key: n, framework, isRoot });
  });
  // Propagate Fastify plugin scope from verified register receivers. Each registration may add a prefix.
  for (let pass = 0; pass < 12; pass++) {
    let changed = false;
    for (const sf of sourceFiles) walk(sf, n => {
      if (!ts.isCallExpression(n) || !ts.isPropertyAccessExpression(n.expression) || n.expression.name.text !== 'register') return;
      const parent = get(n.expression.expression);
      if (parent?.framework !== 'fastify') return;
      const fn = key(n.arguments[0]);
      if (!fn?.parameters?.[0]) return;
      const parameter = fn.parameters[0];
      if (!servers.has(parameter)) { servers.set(parameter, { key: parameter, framework: 'fastify', isRoot: false }); changed = true; }
      if (!mounts.some(m => m.node === n)) {
        const prefixNode = value(n.arguments[1], 'prefix');
        mounts.push({ parent, child: servers.get(parameter), prefix: prefixNode ? literal(prefixNode) : '', node: n, middleware: [] }); changed = true;
      }
    });
    if (!changed) break;
  }
  for (const sf of sourceFiles) walk(sf, n => {
    if (!ts.isCallExpression(n) || !ts.isPropertyAccessExpression(n.expression)) return;
    const r = receiver(n.expression.expression);
    if (!r) return; // Reject unrelated objects with get/post methods.
    const method = n.expression.name.text, args = n.arguments, server = r.server;
    if (server.framework === 'express' && method === 'use') {
      const firstIsHandler = !!symbolId(args[0]) || !!get(args[0]) || (args[0] && (ts.isArrowFunction(args[0]) || ts.isFunctionExpression(args[0])));
      const prefix = literal(args[0]) ?? (firstIsHandler ? '' : undefined);
      const handlers = [...args].slice(firstIsHandler ? 0 : 1).flatMap(flatten);
      for (const h of handlers) {
        const child = get(h);
        if (child?.framework === 'express') mounts.push({ parent: server, child, prefix, node: n, middleware: handlers.filter(x => x !== h && !get(x)) });
      }
    }
    if (methods.has(method) && (r.routePath !== undefined || args.length >= 2)) {
      const routePath = r.routePath ?? literal(args[0]);
      if (routePath === undefined) { warnings.push(`Skipped dynamic ${server.framework} route at ${location(n).file}:${location(n).line}`); return; }
      let handlers = [...args].slice(r.routePath === undefined ? 1 : 0).flatMap(flatten), middleware = [];
      if (server.framework === 'fastify') {
        const config = args[1];
        handlers = [args.length > 2 ? args[2] : value(config, 'handler') || args[1]].filter(Boolean);
        middleware = flatten(value(config, 'preHandler'));
      }
      registrations.push({ server, method: method.toUpperCase(), routePath, handlers, middleware, node: n });
    }
    if (server.framework === 'fastify' && method === 'route') {
      const conf = args[0], routePath = literal(value(conf, 'url'));
      const verbs = value(conf, 'method');
      if (routePath === undefined || !verbs) return;
      for (const verb of strings(verbs)) registrations.push({ server, method: verb.toUpperCase(), routePath, handlers: flatten(value(conf, 'handler')), middleware: flatten(value(conf, 'preHandler')), node: n });
    }
  });
  function prefixes(server, visited = new Set()) {
    if (visited.has(server)) return [{ prefix: undefined, middleware: [], evidence: [] }];
    const seen = new Set(visited).add(server), incoming = mounts.filter(m => m.child === server);
    if (!incoming.length) return [{ prefix: server.isRoot ? '' : undefined, middleware: [], evidence: [] }];
    return incoming.flatMap(m => prefixes(m.parent, seen).map(p => ({ prefix: p.prefix === undefined || m.prefix === undefined ? undefined : join(p.prefix, m.prefix), middleware: [...p.middleware, ...m.middleware], evidence: [...p.evidence, location(m.node)] })));
  }
  function endpoint({ framework, method, routePath, n, handlers, middleware = [], prefix, evidence = [], confidence = 'resolved', note = '' }) {
    const file = location(n).file, fullPath = prefix === undefined ? routePath : join(prefix, routePath);
    const id = unique(`route:${file}:${framework}:${method}:${fullPath}`);
    const rid = add({ id, label: method + ' ' + fullPath, kind: 'endpoint', ...location(n), parent: astIds.get(n.getSourceFile()), framework, method, path: fullPath, localPath: routePath, prefixResolved: prefix !== undefined, confidence, note, registrationEvidence: evidence, fingerprint: hash(JSON.stringify([n.getText(), fullPath, middleware.map(m => m.getText())])) });
    edge(astIds.get(n.getSourceFile()), rid, 'contains', n, confidence, { method: framework + '-registration' });
    [...middleware, ...handlers].forEach((h, i, all) => {
      const role = i < middleware.length || (framework === 'express' && i < all.length - 1) ? 'registers middleware' : 'registers handler';
      edge(rid, symbolId(h), role, h, confidence, { method: framework + '-registration', order: i, scope: i < middleware.length ? 'mount-or-hook' : 'route' });
    });
  }
  for (const r of registrations) for (const p of prefixes(r.server)) endpoint({ framework: r.server.framework, method: r.method, routePath: r.routePath, n: r.node, handlers: r.handlers, middleware: [...p.middleware, ...r.middleware], prefix: p.prefix, evidence: p.evidence, confidence: p.prefix === undefined ? 'inferred' : 'resolved', note: 'Static framework registration. Startup, conditional registration, global middleware, plugin wrappers and runtime reachability require verification.' });
  // NestJS: imported Controller and HTTP decorators. Global prefix/versioning/module reachability remain unknown.
  const decorators = n => ts.canHaveDecorators(n) ? ts.getDecorators(n) || [] : [];
  const calls = n => decorators(n).map(d => d.expression).filter(ts.isCallExpression);
  for (const sf of sourceFiles) walk(sf, n => {
    if (!ts.isClassDeclaration(n)) return;
    const controller = calls(n).find(d => imported(d.expression, '@nestjs/common', 'Controller'));
    if (!controller) return;
    const config = controller.arguments[0], prefixes = config ? strings(value(config, 'path') || config) : [''];
    for (const member of n.members) for (const dec of calls(member)) {
      const verb = [...methods].find(m => imported(dec.expression, '@nestjs/common', m[0].toUpperCase() + m.slice(1)));
      if (!verb) continue;
      const paths = dec.arguments[0] ? strings(dec.arguments[0]) : [''];
      for (const prefix of prefixes) for (const p of paths) endpoint({ framework: 'nestjs', method: verb.toUpperCase(), routePath: join(prefix, p), n: member, handlers: [member], confidence: 'inferred', note: 'Controller-relative route. Global prefix, versioning, guards, dependency injection and module activation are not resolved.' });
    }
  });
  // Next.js App Router: require a declared Next dependency in a nearest package.json.
  function nextProject(file) {
    let dir = path.dirname(file);
    while (dir.startsWith(root)) {
      const pkg = texts.get(path.join(dir, 'package.json'));
      if (pkg) { try { const p = JSON.parse(pkg); return p.dependencies?.next || p.devDependencies?.next ? dir : null; } catch { return null; } }
      if (dir === root) break;
      dir = path.dirname(dir);
    }
    return null;
  }
  for (const sf of sourceFiles) {
    const project = nextProject(sf.fileName);
    if (!project) continue;
    const local = path.relative(project, sf.fileName).split(path.sep).join('/');
    const match = local.match(/^(?:src\/)?app\/(.*)route\.[jt]s$/);
    if (!match) continue;
    const parts = match[1].split('/').filter(Boolean);
    if (parts.some(s => s.startsWith('_') || s.startsWith('@') || /^\(\.\.?/.test(s))) continue;
    const routePath = '/' + parts.filter(s => !/^\(.*\)$/.test(s)).join('/');
    for (const stmt of sf.statements) {
      const exported = stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (exported && ts.isFunctionDeclaration(stmt) && nextMethod(stmt.name?.text)) endpoint({ framework: 'nextjs', method: stmt.name.text, routePath, n: stmt, handlers: [stmt], confidence: 'inferred', note: 'App Router route. basePath, rewrites, middleware and deployment configuration are not resolved.' });
      if (exported && ts.isVariableStatement(stmt)) for (const d of stmt.declarationList.declarations) if (nextMethod(d.name.getText())) endpoint({ framework: 'nextjs', method: d.name.getText(), routePath, n: d, handlers: [d.name], confidence: 'inferred', note: 'App Router route; configuration and runtime reachability require verification.' });
      if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) for (const e of stmt.exportClause.elements) if (nextMethod(e.name.text)) endpoint({ framework: 'nextjs', method: e.name.text, routePath, n: e, handlers: [e.propertyName || e.name], confidence: 'inferred', note: 'App Router named export; configuration and runtime reachability require verification.' });
    }
  }
};
