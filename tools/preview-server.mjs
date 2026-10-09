#!/usr/bin/env node
/**
 * Local preview of Design 4.0 against your own CRM capture.
 * The capture holds real workspace data, so it is read from disk and never
 * copied into the repository.
 *
 *   node redesign/build.mjs
 *   node tools/preview-server.mjs /path/to/unzipped-capture [port]
 *   open http://localhost:8040/forever-crm/?company=4&tab=leads
 *   add &design=0 to see the same screen without the redesign
 *
 * Serves the untouched server HTML from <capture>/raw/, makes its links
 * same-origin, maps plugin assets to plugin/assets/, and adds the two
 * Design 4.0 tags before </head> exactly as the mu-plugin does.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const capture = path.resolve(process.argv[2] || 'capture');
const port = Number(process.argv[3] || 8040);
const index = JSON.parse(fs.readFileSync(path.join(capture, 'capture-index.json'), 'utf8'));
const origin = new URL(index.source).origin;
const types = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain', '.html': 'text/html; charset=utf-8' };

function screenFor(searchParams) {
  const want = new URLSearchParams(searchParams);
  want.delete('company'); want.delete('design');
  let best = null; let bestScore = -1;
  for (const s of index.screens) {
    const key = new URLSearchParams(s.key);
    let ok = true; let score = 0;
    for (const [k, v] of key) { if (want.get(k) === v) score += 1; else ok = false; }
    if (ok && score > bestScore) { best = s; bestScore = score; }
  }
  return best || index.screens[0];
}

function send(res, file, type) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': type || types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const p = decodeURIComponent(url.pathname);
  if (p.startsWith('/wp-content/plugins/') && p.includes('/assets/')) {
    return send(res, path.join(repo, 'plugin', 'assets', p.split('/assets/')[1]));
  }
  if (p.startsWith('/fx/')) return send(res, path.join(repo, 'dist', 'mu-plugins', 'forever-crm-design', p.slice(4)));
  if (p === '/forever-crm/' || p === '/') {
    const screen = screenFor(url.searchParams);
    let html = fs.readFileSync(path.join(capture, 'raw', screen.file), 'utf8').split(origin).join('');
    if (url.searchParams.get('design') !== '0') {
      const i = html.toLowerCase().lastIndexOf('</head>');
      html = html.slice(0, i) + '<link rel="stylesheet" href="/fx/design-400.css"><script src="/fx/design-400.js" defer></script>' + html.slice(i);
    }
    res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
    return res.end(html);
  }
  res.writeHead(404); res.end('Not found');
}).listen(port, () => console.log(`Design 4.0 preview: http://localhost:${port}/forever-crm/?tab=overview`));
