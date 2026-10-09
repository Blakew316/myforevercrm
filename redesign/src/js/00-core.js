/* Shared helpers. Everything below runs inside one closure created by the
   build (see redesign/build.mjs); ICONS is injected there. */

var doc = document;
var root = doc.documentElement;
var app = doc.querySelector('.app[data-sidebar-app]');

// Public pages (sign-in, pricing, portals) do not use the app shell.
if (!app || root.classList.contains('fx-ready')) return;

var sidebar = doc.getElementById('forever-crm-sidebar');
var main = app.querySelector('main');
if (!main) return;

var params = new URLSearchParams(location.search);
var currentTab = params.get('tab') || 'overview';
var companyId = params.get('company') || '';
var isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
var MOD_LABEL = isApple ? '⌘' : 'Ctrl';
var KEY = 'fx400:' + companyId + ':';

function qs(sel, scope) { return (scope || doc).querySelector(sel); }
function qsa(sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); }

/** Create an element: el('a', {href: '#', class: 'x'}, ['text', node]) */
function el(tag, attrs, children) {
  var node = doc.createElement(tag);
  Object.keys(attrs || {}).forEach(function (name) {
    var value = attrs[name];
    if (value === false || value === null || value === undefined) return;
    if (name === 'text') node.textContent = value;
    else if (name === 'class') node.className = value;
    else node.setAttribute(name, value === true ? '' : value);
  });
  (children || []).forEach(function (child) {
    if (child === null || child === undefined || child === false) return;
    node.appendChild(typeof child === 'string' ? doc.createTextNode(child) : child);
  });
  return node;
}

/** Inline SVG icon from the shared set. */
function icon(name, cls) {
  var wrap = doc.createElement('span');
  wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    (ICONS[name] || ICONS.circle).replace(/#000/g, 'currentColor') + '</svg>';
  var svg = wrap.firstChild;
  if (cls) svg.setAttribute('class', cls);
  return svg;
}

/** Storage that never throws (private mode, blocked storage). */
var store = {
  get: function (name, fallback, area) {
    try {
      var raw = (area || localStorage).getItem(KEY + name);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set: function (name, value, area) {
    try { (area || localStorage).setItem(KEY + name, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
};

/** Visible label of a nav link or summary, without pin stars or icons. */
function labelOf(node) {
  if (!node) return '';
  var text = '';
  Array.prototype.forEach.call(node.childNodes, function (child) {
    if (child.nodeType === 3) text += child.nodeValue;
    else if (child.nodeType === 1 && !child.matches('.crm-nav-pin, svg, [aria-hidden="true"], .fx-sr')) text += child.textContent;
  });
  return text.replace(/[★☆⌄⌄]/g, '').replace(/\s+/g, ' ').trim();
}

/** Comparable form of a CRM URL: its query parameters minus noise. */
function routeOf(href) {
  try {
    var u = new URL(href, location.href);
    if (u.origin !== location.origin) return null;
    var p = u.searchParams;
    ['company', 'notice', 'preview', '_wpnonce'].forEach(function (k) { p.delete(k); });
    return { tab: p.get('tab') || 'overview', params: p, url: u };
  } catch (e) { return null; }
}

function isTyping(target) {
  if (!target || !target.closest) return false;
  return !!target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
}

function onReady(fn) {
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn);
  else fn();
}

var desktop = window.matchMedia('(min-width: 1024px)');
var phone = window.matchMedia('(max-width: 780px)');

/** Normalise text for matching: lowercase, no accents, "&" as "and". */
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Overlays live outside .app; give them the workspace brand color too.
(function syncBrand() {
  var gold = (app.style.getPropertyValue('--gold') || '').trim();
  if (gold) root.style.setProperty('--gold', gold);
})();
