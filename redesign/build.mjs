#!/usr/bin/env node
/**
 * Builds Design 4.0 from redesign/src into dist/:
 *   dist/mu-plugins/forever-crm-design.php          (loader, copied from integration/)
 *   dist/mu-plugins/forever-crm-design/design-400.css|js + fonts/
 *   dist/drop-in/crm.css, sidebar.js, fonts/         (zero-PHP alternative)
 * Usage: node redesign/build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS, TINTED, svgMarkup } from './src/icons.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const src = path.join(here, 'src');
const read = (p) => fs.readFileSync(p, 'utf8');
const list = (dir, ext) => fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)).sort().map((f) => path.join(dir, f))
  : [];

// Minimal escaping keeps data URIs smaller than encodeURIComponent would.
const dataUri = (svg) => 'url("data:image/svg+xml,' +
  svg.replace(/"/g, "'").replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E') + '")';

// Icon custom properties for CSS masks / backgrounds.
const iconVars = Object.entries(ICONS)
  .map(([name, inner]) => `  --fx-i-${name}: ${dataUri(svgMarkup(inner))};`);
// White glyphs for the colored icon tiles (sidebar, palette).
for (const [name, inner] of Object.entries(ICONS)) {
  iconVars.push(`  --fx-iw-${name}: ${dataUri(svgMarkup(inner.replace(/#000/g, '#fff'), '#fff'))};`);
}
for (const [name, colors] of Object.entries(TINTED)) {
  for (const [suffix, color] of Object.entries(colors)) {
    iconVars.push(`  --fx-i-${name}-${suffix}: ${dataUri(svgMarkup(ICONS[name], color))};`);
  }
}

const header = `/*! My Forever CRM — Design 4.0 · built ${new Date().toISOString().slice(0, 10)} · source: redesign/src */\n`;
const cssParts = [...list(path.join(src, 'css'), '.css'), ...list(path.join(src, 'css', 'screens'), '.css')];
let css = header + cssParts.map((f) => `/* ${path.relative(src, f)} */\n${read(f)}`).join('\n');
css = css.replace('/*@icons*/', iconVars.join('\n').trimStart());

const jsIcons = 'var ICONS = ' + JSON.stringify(ICONS) + ';\n';
const js = header + "(function () {\n'use strict';\n" + jsIcons +
  list(path.join(src, 'js'), '.js').map((f) => `/* ${path.relative(src, f)} */\n${read(f)}`).join('\n') + '\n})();\n';

new Function(js.replace(/^\/\*![^\n]*\n/, '')); // syntax check only, not executed

const out = path.join(repo, 'dist');
const mu = path.join(out, 'mu-plugins', 'forever-crm-design');
const dropIn = path.join(out, 'drop-in');
const fontsSrc = path.join(repo, 'plugin', 'assets', 'fonts');
for (const dir of [mu, dropIn]) {
  fs.mkdirSync(path.join(dir, 'fonts'), { recursive: true });
  for (const f of fs.readdirSync(fontsSrc)) fs.copyFileSync(path.join(fontsSrc, f), path.join(dir, 'fonts', f));
}
fs.writeFileSync(path.join(mu, 'design-400.css'), css);
fs.writeFileSync(path.join(mu, 'design-400.js'), js);
fs.copyFileSync(path.join(repo, 'integration', 'forever-crm-design.php'), path.join(out, 'mu-plugins', 'forever-crm-design.php'));

// Drop-in: the original files with Design 4.0 appended (crm.css / sidebar.js load on every screen).
const legacy = path.join(repo, 'plugin', 'assets');
fs.writeFileSync(path.join(dropIn, 'crm.css'), read(path.join(legacy, 'crm.css')) + '\n\n' + css);
fs.writeFileSync(path.join(dropIn, 'sidebar.js'), read(path.join(legacy, 'sidebar.js')) + '\n\n' + js);

console.log(`design-400.css ${(css.length / 1024).toFixed(1)} KB · design-400.js ${(js.length / 1024).toFixed(1)} KB · ${cssParts.length} CSS partials`);
