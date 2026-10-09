#!/usr/bin/env node
/**
 * Turns a CRM screen capture into anonymised demo screens for the public
 * Netlify preview:  node tools/make-demo.mjs /path/to/unzipped-capture
 *
 * Writes demo/screens/*.html and demo/index.json. Replaces the signed-in
 * person's name, login email, workspace name, every e-mail address and
 * phone number, security nonces, API keys and avatar URLs. Afterwards it
 * refuses to finish if any of the original values are still present.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const capture = path.resolve(process.argv[2] || 'capture');
const index = JSON.parse(fs.readFileSync(path.join(capture, 'capture-index.json'), 'utf8'));
const origin = new URL(index.source).origin;
const outDir = path.join(repo, 'demo', 'screens');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const first = fs.readFileSync(path.join(capture, 'raw', index.screens[0].file), 'utf8');
const pick = (re) => { const m = re.exec(first); return m ? m[1].trim() : ''; };
const person = pick(/<div class="aside-bottom"><strong>([^<]+)<\/strong>/);
const email = pick(/Signed in as <strong>([^<]+)<\/strong>/);
const workspace = pick(/<\/h1><p class="muted">([^<]+)<\/p>/);
// The workspace name also appears without its legal suffix ("Acme" for "Acme LLC").
const workspaceShort = workspace.replace(/[,\s]+(LLC|L\.L\.C\.|Inc\.?|Ltd\.?|Co\.?|Corp\.?)$/i, '').trim();
const secrets = [person, email, workspace, workspaceShort, ...person.split(/\s+/)].filter((s) => s && s.length > 2);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function scrub(html) {
  let out = html.split(origin).join('');
  if (person) out = out.replace(new RegExp(esc(person), 'g'), 'Alex Morgan');
  if (workspace) out = out.replace(new RegExp(esc(workspace), 'g'), 'Demo Workspace');
  if (workspaceShort) out = out.replace(new RegExp('\\b' + esc(workspaceShort) + '\\b', 'g'), 'Demo Workspace');
  out = out
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (m) => (m.endsWith('@example.com') ? m : 'alex@example.com'))
    .replace(/(?<![\d\w])\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}(?!\d)/g, '555-010-0100')
    .replace(/tel:\+?\d[\d\s().-]{6,}/g, 'tel:5550100100')
    .replace(/(name="_wpnonce" value=")[^"]*/g, '$1demo')
    .replace(/(_wpnonce=)[\w-]+/g, '$1demo')
    .replace(/("nonce"\s*:\s*")[^"]*/g, '$1demo')
    .replace(/(nonce["'=:\s\\]{1,8})[0-9a-f]{10}\b/gi, '$1demo')
    .replace(/AIza[\w-]{20,}/g, 'DEMO_KEY')
    .replace(/<script[^>]*maps\.googleapis\.com[^>]*><\/script>/g, '')
    .replace(/https:\/\/secure\.gravatar\.com\/avatar\/[^"' )]*/g, '')
    .replace(/\bRichie\b/g, 'Alex')
    .replace(/https:\/\/images\.unsplash\.com\/(photo-[\w-]+)[^"' )]*/g, '/media/$1.jpg');
  for (const word of person.split(/\s+/).filter((w) => w.length > 2)) {
    out = out.replace(new RegExp('\\b' + esc(word) + '\\b', 'g'), word === person.split(/\s+/)[0] ? 'Alex' : 'Morgan');
  }
  return out;
}

const screens = [];
for (const s of index.screens) {
  const html = scrub(fs.readFileSync(path.join(capture, 'raw', s.file), 'utf8'));
  const leaks = secrets.filter((v) => html.includes(v));
  if (leaks.length) throw new Error(`${s.file} still contains: ${leaks.join(', ')}`);
  fs.writeFileSync(path.join(outDir, s.file), html);
  screens.push({ file: s.file, key: s.key });
}
fs.writeFileSync(path.join(repo, 'demo', 'index.json'), JSON.stringify({ screens }, null, 1) + '\n');

// Stock photos used by the document template library, served locally.
const photos = path.join(capture, 'assets', 'external', 'images.unsplash.com');
if (fs.existsSync(photos)) {
  const media = path.join(repo, 'demo', 'media');
  fs.mkdirSync(media, { recursive: true });
  for (const f of fs.readdirSync(photos)) fs.copyFileSync(path.join(photos, f), path.join(media, f));
}

// Installable-app manifest, pointed at the demo instead of the live site.
const manifest = path.join(capture, 'assets', 'root', 'fagcrm_manifest.webmanifest');
if (fs.existsSync(manifest)) {
  const m = fs.readFileSync(manifest, 'utf8').split(origin.replace(/\//g, '\\/')).join('').split(origin).join('');
  fs.writeFileSync(path.join(repo, 'demo', 'manifest.webmanifest'), m);
}
console.log(`${screens.length} anonymised screens written to demo/screens`);
