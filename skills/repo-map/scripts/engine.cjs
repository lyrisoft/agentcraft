'use strict';
const path = require('node:path');
const { createHash } = require('node:crypto');
const hash = text => createHash('sha256').update(text).digest('hex');

function analyze(ts, root, texts) {
  const rel = p => path.relative(root, p).split(path.sep).join('/');
  const absolute = p => path.resolve(p);
  const source = [...texts.keys()].filter(p => /\.[cm]?[jt]sx?$/.test(p) && !/\.d\.[cm]?ts$/.test(p)).sort();
  const warnings = [];
  const sys = {
    ...ts.sys,
    fileExists: p => texts.has(absolute(p)) || (!absolute(p).startsWith(root + path.sep) && ts.sys.fileExists(p)),
    readFile: p => texts.get(absolute(p)) ?? (!absolute(p).startsWith(root + path.sep) ? ts.sys.readFile(p) : undefined),
    directoryExists: p => [...texts.keys()].some(f => f.startsWith(absolute(p) + path.sep)) || (!absolute(p).startsWith(root) && ts.sys.directoryExists(p)),
  };
  let options = { allowJs: true, checkJs: false, noEmit: true, skipLibCheck: true, target: ts.ScriptTarget.Latest, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext };
  const config = texts.get(path.join(root, 'tsconfig.json'));
  if (config) {
    const parsed = ts.parseConfigFileTextToJson('tsconfig.json', config);
    if (parsed.error) warnings.push(ts.flattenDiagnosticMessageText(parsed.error.messageText, ' '));
    else {
      const result = ts.parseJsonConfigFileContent(parsed.config, sys, root);
      options = { ...options, ...result.options, allowJs: true, noEmit: true };
      warnings.push(...result.errors.filter(e => e.code !== 18003).map(e => ts.flattenDiagnosticMessageText(e.messageText, ' ')));
    }
  }
  const host = ts.createCompilerHost(options);
  host.fileExists = sys.fileExists;
  host.readFile = sys.readFile;
  host.directoryExists = sys.directoryExists;
  host.getSourceFile = (file, language) => {
    const content = sys.readFile(file);
    return content === undefined ? undefined : ts.createSourceFile(file, content, language, true);
  };
  const program = ts.createProgram(source, options, host), checker = program.getTypeChecker();
  const nodes = [], edges = [], astIds = new Map(), nodeMap = new Map(), keys = new Map(), edgeKeys = new Set();
  const add = n => { if (!nodeMap.has(n.id)) { nodes.push(n); nodeMap.set(n.id, n); } return n.id; };
  const unique = key => { const count = keys.get(key) || 0; keys.set(key, count + 1); return count ? `${key}#${count}` : key; };
  const location = n => { const sf = n.getSourceFile(); return { file: rel(sf.fileName), line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1, endLine: sf.getLineAndCharacterOfPosition(n.end).line + 1 }; };
  const edge = (from, to, type, n, confidence = 'resolved', extra = {}) => {
    if (!from || !to) return;
    const evidence = { ...location(n), method: extra.method || 'typescript-symbol' };
    const key = [from, to, type, evidence.file, evidence.line, extra.order, extra.scope].join('|');
    if (!edgeKeys.has(key)) { edgeKeys.add(key); edges.push({ source: from, target: to, type, confidence, evidence, ...extra }); }
  };
  const symbol = expr => checker.getSymbolAtLocation(expr);
  const declaration = expr => {
    let s = symbol(expr);
    if (s?.flags & ts.SymbolFlags.Alias && s.declarations?.some(d => ts.isImportSpecifier(d) || ts.isImportClause(d) || ts.isNamespaceImport(d) || ts.isExportSpecifier(d))) { try { s = checker.getAliasedSymbol(s); } catch {} }
    return s?.valueDeclaration || s?.declarations?.[0];
  };
  const resolveExpr = (expr, seen = new Set()) => {
    if (!expr || seen.has(expr)) return expr;
    seen.add(expr);
    if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr) || ts.isAwaitExpression(expr) || ts.isNonNullExpression(expr)) return resolveExpr(expr.expression, seen);
    const d = declaration(expr);
    if (d?.initializer) return resolveExpr(d.initializer, seen);
    if (d && ts.isExportAssignment(d)) return resolveExpr(d.expression, seen);
    return d || expr;
  };
  const symbolId = expr => {
    const d = resolveExpr(expr);
    return astIds.get(expr) || astIds.get(d);
  };
  const imported = (expr, pkg, name = 'default') => {
    if (!expr) return false;
    if (ts.isPropertyAccessExpression(expr)) return imported(expr.expression, pkg, '*') && expr.name.text === name;
    const s = symbol(expr);
    for (const d of s?.declarations || []) {
      let p = d;
      while (p && !ts.isImportDeclaration(p)) p = p.parent;
      if (p?.moduleSpecifier?.text !== pkg) continue;
      if (ts.isImportClause(d) && name === 'default') return true;
      if (ts.isNamespaceImport(d) && (name === '*' || name === 'default')) return true;
      if (ts.isImportSpecifier(d) && (d.propertyName?.text || d.name.text) === name) return true;
    }
    // CommonJS factory imports, including `const {Router} = require('express')`.
    const d = s?.valueDeclaration || s?.declarations?.[0];
    if (d && ts.isBindingElement(d)) {
      const init = d.parent.parent.initializer;
      return isRequire(init, pkg) && (d.propertyName?.text || d.name.text) === name;
    }
    return d && ts.isVariableDeclaration(d) && isRequire(d.initializer, pkg) && ['default', '*'].includes(name);
  };
  function isRequire(n, pkg) { return n && ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'require' && !declaration(n.expression) && n.arguments[0]?.text === pkg; }
  const literal = n => n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : undefined;
  const strings = n => ts.isArrayLiteralExpression(n) ? n.elements.flatMap(x => strings(x)) : literal(n) === undefined ? [] : [literal(n)];
  const property = (n, name) => n && ts.isObjectLiteralExpression(n) ? n.properties.find(p => p.name?.getText().replace(/['"]/g, '') === name) : undefined;
  const value = (n, name) => { const p = property(n, name); return p?.initializer || (p && ts.isShorthandPropertyAssignment(p) ? p.name : p); };
  const walk = (n, fn) => { fn(n); ts.forEachChild(n, c => walk(c, fn)); };
  const sourceFiles = source.map(p => program.getSourceFile(p)).filter(Boolean);
  for (const d of program.getSyntacticDiagnostics()) warnings.push((d.file ? rel(d.file.fileName) + ': ' : '') + ts.flattenDiagnosticMessageText(d.messageText, ' '));
  for (const sf of sourceFiles) {
    const file = rel(sf.fileName), fid = 'file:' + file;
    add({ id: fid, label: file, kind: 'module', file, line: 1, endLine: sf.getLineAndCharacterOfPosition(sf.end).line + 1, fingerprint: hash(sf.text) }); astIds.set(sf, fid);
    function visit(n, parent) {
      let id = parent;
      const kind = ts.isClassDeclaration(n) || ts.isClassExpression(n) ? 'class' : ts.isMethodDeclaration(n) || ts.isConstructorDeclaration(n) || ts.isGetAccessorDeclaration(n) || ts.isSetAccessorDeclaration(n) ? 'method' : ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) ? 'function' : null;
      if (kind) {
        let label = n.name?.getText(sf);
        if (!label && (ts.isVariableDeclaration(n.parent) || ts.isPropertyAssignment(n.parent))) label = n.parent.name.getText(sf);
        label ||= ts.isConstructorDeclaration(n) ? 'constructor' : 'anonymous';
        id = unique(`${parent}/${kind}:${label}`);
        add({ id, label, kind, ...location(n), parent, fingerprint: hash(n.getText(sf)), excerpt: n.getText(sf).slice(0, 2000), signature: n.getText(sf).split(/\{|=>/)[0].trim().slice(0, 300) });
        astIds.set(n, id); if (ts.isVariableDeclaration(n.parent)) astIds.set(n.parent, id);
        edge(parent, id, 'contains', n, 'resolved', { method: 'typescript-ast' });
      }
      ts.forEachChild(n, c => visit(c, id));
    }
    ts.forEachChild(sf, n => visit(n, fid));
  }
  let unresolvedCalls = 0;
  for (const sf of sourceFiles) {
    function visit(n, owner) {
      owner = astIds.get(n) || owner;
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
        const resolved = ts.resolveModuleName(n.moduleSpecifier.text, sf.fileName, options, sys).resolvedModule;
        const target = resolved && nodeMap.has('file:' + rel(resolved.resolvedFileName)) ? 'file:' + rel(resolved.resolvedFileName) : add({ id: 'external:' + n.moduleSpecifier.text, label: n.moduleSpecifier.text, kind: 'external' });
        edge(astIds.get(sf), target, 'imports', n, 'resolved', { method: 'typescript-module' });
      }
      if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
        const target = symbolId(n.expression);
        if (target) edge(owner, target, ts.isNewExpression(n) ? 'constructs' : 'calls', n); else unresolvedCalls++;
      }
      if (ts.isHeritageClause(n)) for (const t of n.types) edge(owner, symbolId(t.expression), n.token === ts.SyntaxKind.ExtendsKeyword ? 'extends' : 'implements', t);
      ts.forEachChild(n, c => visit(c, owner));
    }
    visit(sf, astIds.get(sf));
  }
  require('./frameworks.cjs')({ ts, root, texts, sourceFiles, astIds, nodeMap, add, unique, edge, location, hash, resolveExpr, declaration, imported, literal, strings, property, value, walk, symbolId, warnings });
  return { nodes, edges, warnings, unresolvedCalls, files: source.length };
}
module.exports = { analyze, hash };
