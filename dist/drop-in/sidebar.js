(function(){
  'use strict';
  var storageKey='foreverCrmSidebarHidden';
  function savedHidden(){try{return window.localStorage.getItem(storageKey)==='1';}catch(error){return false;}}
  function remember(hidden){try{window.localStorage.setItem(storageKey,hidden?'1':'0');}catch(error){}}
  function apply(app,button,hidden){
    app.classList.toggle('sidebar-hidden',hidden);
    button.setAttribute('aria-expanded',hidden?'false':'true');
    var label=button.querySelector('[data-sidebar-label]');if(label){label.textContent=hidden?'Show sidebar':'Hide sidebar';}
  }
  document.addEventListener('DOMContentLoaded',function(){
    var app=document.querySelector('[data-sidebar-app]');var button=document.querySelector('[data-sidebar-toggle]');if(!app||!button){return;}
    apply(app,button,savedHidden());
    button.addEventListener('click',function(){var hidden=!app.classList.contains('sidebar-hidden');apply(app,button,hidden);remember(hidden);});
  });
})();


// 1.79 global command search + quick launcher.
document.addEventListener('DOMContentLoaded',function(){
  var input=document.getElementById('crm-command-search');
  document.addEventListener('keydown',function(e){
    var tag=(document.activeElement&&document.activeElement.tagName||'').toLowerCase();
    if((e.key==='/' && !['input','textarea','select'].includes(tag)) || ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){e.preventDefault();if(input){input.focus();input.select();}}
    if(e.key==='Escape'){document.querySelectorAll('[data-quick-menu]').forEach(function(m){m.hidden=true;});}
  });
  document.querySelectorAll('[data-quick-toggle]').forEach(function(btn){btn.addEventListener('click',function(){var menu=btn.parentElement.querySelector('[data-quick-menu]');if(menu){menu.hidden=!menu.hidden;}});});
  document.addEventListener('click',function(e){document.querySelectorAll('.crm-command-wrap').forEach(function(w){if(!w.contains(e.target)){var m=w.querySelector('[data-quick-menu]');if(m)m.hidden=true;}});});
});


/*! My Forever CRM — Design 4.0 · built 2026-10-09 · source: redesign/src */
(function () {
'use strict';
var ICONS = {"circle":"<circle cx=\"12\" cy=\"12\" r=\"3.2\" fill=\"#000\" stroke=\"none\"/>","house":"<path d=\"M4 10.4 12 4l8 6.4V19a1 1 0 0 1-1 1h-4.6v-5.6H9.6V20H5a1 1 0 0 1-1-1z\"/>","people":"<circle cx=\"9\" cy=\"8.5\" r=\"3.25\"/><path d=\"M3.25 19c.65-3.05 2.85-4.8 5.75-4.8s5.1 1.75 5.75 4.8\"/><path d=\"M15.4 5.55a3.15 3.15 0 0 1 0 5.9\"/><path d=\"M17 14.35c2 .55 3.25 2.05 3.75 4.65\"/>","team":"<circle cx=\"12\" cy=\"8.2\" r=\"3\"/><path d=\"M6.6 19.4c.55-3 2.75-4.7 5.4-4.7s4.85 1.7 5.4 4.7\"/><circle cx=\"5.4\" cy=\"10.2\" r=\"2.1\"/><circle cx=\"18.6\" cy=\"10.2\" r=\"2.1\"/><path d=\"M2.4 17.4c.3-1.65 1.35-2.7 2.95-3M21.6 17.4c-.3-1.65-1.35-2.7-2.95-3\"/>","person":"<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/><path d=\"M6.3 18.4c1.15-2.05 3.15-3.15 5.7-3.15s4.55 1.1 5.7 3.15\"/>","phone":"<path d=\"M6.7 3.75h2.55l1.45 4.05-2.05 1.5a11.2 11.2 0 0 0 6.05 6.05l1.5-2.05 4.05 1.45v2.55a2.05 2.05 0 0 1-2.15 2.05C10.6 18.95 5.05 13.4 4.6 5.9a2.05 2.05 0 0 1 2.1-2.15z\"/>","phone-device":"<rect x=\"7\" y=\"2.75\" width=\"10\" height=\"18.5\" rx=\"2.5\"/><path d=\"M10.5 5.75h3M11 18h2\"/>","headset":"<path d=\"M4.5 14.5V12a7.5 7.5 0 0 1 15 0v2.5\"/><rect x=\"3.5\" y=\"13.25\" width=\"4\" height=\"6\" rx=\"1.6\"/><rect x=\"16.5\" y=\"13.25\" width=\"4\" height=\"6\" rx=\"1.6\"/><path d=\"M18.5 19.25c0 1.3-1.55 2-4 2H13\"/>","calendar":"<rect x=\"3.75\" y=\"5\" width=\"16.5\" height=\"15.25\" rx=\"3\"/><path d=\"M3.75 9.75h16.5M8 3v4M16 3v4\"/>","doc":"<path d=\"M7 3.5h6.4l5.1 5.1v10.9a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-14.5A1.5 1.5 0 0 1 7 3.5z\"/><path d=\"M13.4 3.5v5.1h5.1M9 13h6M9 16.5h6\"/>","chart":"<path d=\"M4 20h16\"/><rect x=\"5.5\" y=\"11\" width=\"3\" height=\"6.5\" rx=\"1\"/><rect x=\"10.5\" y=\"6.5\" width=\"3\" height=\"11\" rx=\"1\"/><rect x=\"15.5\" y=\"9\" width=\"3\" height=\"8.5\" rx=\"1\"/>","dollar":"<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><path d=\"M14.6 9.25c-.4-1-1.35-1.6-2.6-1.6-1.6 0-2.7.8-2.7 2s1 1.7 2.7 2.1 2.8.9 2.8 2.2-1.2 2.1-2.8 2.1c-1.3 0-2.3-.6-2.7-1.7M12 6v1.65M12 16.05v1.8\"/>","gauge":"<path d=\"M4.1 17.2a8.75 8.75 0 1 1 15.8 0\"/><path d=\"M12 13.4l3.7-3.9\"/><circle cx=\"12\" cy=\"13.6\" r=\"1.3\"/>","book":"<path d=\"M12 6.6C10.2 5.2 7.7 4.5 4.5 4.5v13c3.2 0 5.7.7 7.5 2.1 1.8-1.4 4.3-2.1 7.5-2.1v-13c-3.2 0-5.7.7-7.5 2.1z\"/><path d=\"M12 6.6v13\"/>","mappin":"<path d=\"M12 21s-6.5-5.65-6.5-11.1a6.5 6.5 0 0 1 13 0C18.5 15.35 12 21 12 21z\"/><circle cx=\"12\" cy=\"9.9\" r=\"2.4\"/>","map":"<path d=\"M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z\"/><path d=\"M9 4.5v13M15 6.5v13\"/>","briefcase":"<rect x=\"3.5\" y=\"7\" width=\"17\" height=\"12.5\" rx=\"2.5\"/><path d=\"M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17\"/>","heart":"<path d=\"M12 19.6s-7.75-4.45-7.75-10.1A4.2 4.2 0 0 1 12 7.15a4.2 4.2 0 0 1 7.75 2.35c0 5.65-7.75 10.1-7.75 10.1z\"/>","building":"<path d=\"M4.5 20.5V5.5A1.5 1.5 0 0 1 6 4h7a1.5 1.5 0 0 1 1.5 1.5v15M14.5 10H18a1.5 1.5 0 0 1 1.5 1.5v9M3 20.5h18\"/><path d=\"M8 8h3M8 11.5h3M8 15h3\"/>","box":"<path d=\"M3.75 7.6 12 3.5l8.25 4.1v8.8L12 20.5l-8.25-4.1z\"/><path d=\"M3.75 7.6 12 11.7l8.25-4.1M12 11.7v8.8\"/>","tag":"<path d=\"M3.5 12.2V4.8a1.3 1.3 0 0 1 1.3-1.3h7.4l8.3 8.3a1.3 1.3 0 0 1 0 1.85l-7.2 7.2a1.3 1.3 0 0 1-1.85 0z\"/><circle cx=\"8\" cy=\"8\" r=\"1.5\"/>","banknote":"<rect x=\"2.75\" y=\"6\" width=\"18.5\" height=\"12\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/><path d=\"M6 9.5v5M18 9.5v5\"/>","bolt":"<path d=\"M13 2.75 5.25 13.25h6.25l-1 8L18.25 10.75H12z\"/>","wrench":"<path d=\"M14.7 3.9a4.6 4.6 0 0 0-5.35 6l-5.6 5.6a1.95 1.95 0 0 0 2.75 2.75l5.6-5.6a4.6 4.6 0 0 0 6-5.35l-2.85 2.85-2.6-.4-.4-2.6z\"/>","creditcard":"<rect x=\"2.75\" y=\"5\" width=\"18.5\" height=\"14\" rx=\"2.5\"/><path d=\"M2.75 9.5h18.5M6.5 15h3.5\"/>","sliders":"<path d=\"M4 7h9M17 7h3M4 17h3M11 17h9\"/><circle cx=\"15\" cy=\"7\" r=\"2\"/><circle cx=\"9\" cy=\"17\" r=\"2\"/>","link":"<path d=\"M10 14a4 4 0 0 0 5.65 0l3-3A4 4 0 0 0 13 5.35l-1.2 1.2\"/><path d=\"M14 10a4 4 0 0 0-5.65 0l-3 3A4 4 0 0 0 11 18.65l1.2-1.2\"/>","lock":"<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2.5\"/><path d=\"M8 10.5V8a4 4 0 0 1 8 0v2.5\"/>","archive":"<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"4.5\" rx=\"1.5\"/><path d=\"M5 9v9a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18V9M10 13h4\"/>","search":"<circle cx=\"10.75\" cy=\"10.75\" r=\"6.25\"/><path d=\"m15.5 15.5 4.75 4.75\"/>","envelope":"<rect x=\"3\" y=\"5.5\" width=\"18\" height=\"13\" rx=\"2.5\"/><path d=\"m3.75 7.25 8.25 6 8.25-6\"/>","bell":"<path d=\"M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z\"/><path d=\"M10 20.5a2.2 2.2 0 0 0 4 0\"/>","plus":"<path d=\"M12 5v14M5 12h14\"/>","sidebar":"<rect x=\"3\" y=\"4.5\" width=\"18\" height=\"15\" rx=\"3\"/><path d=\"M9.5 4.5v15M5.5 8.25h1.5M5.5 11.25h1.5\"/>","chevron-left":"<path d=\"m14.5 5.5-6.5 6.5 6.5 6.5\"/>","chevron-right":"<path d=\"m9.5 5.5 6.5 6.5-6.5 6.5\"/>","chevron-down":"<path d=\"m5.5 9.25 6.5 6.5 6.5-6.5\"/>","chevron-updown":"<path d=\"m8 9.5 4-4 4 4M8 14.5l4 4 4-4\"/>","star":"<path d=\"m12 3.8 2.5 5.1 5.6.8-4 3.95.95 5.6L12 16.6l-5.05 2.65.95-5.6-4-3.95 5.6-.8z\"/>","star-fill":"<path d=\"m12 3.8 2.5 5.1 5.6.8-4 3.95.95 5.6L12 16.6l-5.05 2.65.95-5.6-4-3.95 5.6-.8z\" fill=\"#000\"/>","clock":"<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><path d=\"M12 7.5V12l3 2\"/>","checklist":"<path d=\"m4 7 1.5 1.5L8.5 5.5M4 13l1.5 1.5 3-3M11.5 7h8.5M11.5 13h8.5M11.5 18.5h8.5\"/>","logout":"<path d=\"M14 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h7\"/><path d=\"M16 8.5 19.5 12 16 15.5M19.5 12H10\"/>","help":"<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><path d=\"M9.6 9.6a2.5 2.5 0 0 1 4.85.85c0 1.75-2.45 2.1-2.45 3.65\"/><path d=\"M12 17.1v.01\" stroke-width=\"2.4\"/>","keyboard":"<rect x=\"2.75\" y=\"6\" width=\"18.5\" height=\"12\" rx=\"2.5\"/><path d=\"M6.5 10h1M10 10h1M13.5 10h1M17 10h.5M7.5 14h9\"/>","sparkles":"<path d=\"M10 3.5 11.6 8.4 16.5 10l-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6z\"/><path d=\"m17.5 14.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z\"/>","grid":"<rect x=\"4\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"4\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/>","return":"<path d=\"M19 5.5v6a2.5 2.5 0 0 1-2.5 2.5H6\"/><path d=\"m9.5 10.5-3.5 3.5 3.5 3.5\"/>","message":"<path d=\"M5 19V7a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 7v6.5a2.5 2.5 0 0 1-2.5 2.5H9z\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><path d=\"M12 11v5.25\"/><path d=\"M12 7.9v.01\" stroke-width=\"2.4\"/>","warning":"<path d=\"M10.3 4.6a2 2 0 0 1 3.4 0l7.05 12.2a2 2 0 0 1-1.7 3H4.95a2 2 0 0 1-1.7-3z\"/><path d=\"M12 9.5v4\"/><path d=\"M12 16.6v.01\" stroke-width=\"2.4\"/>","check-circle":"<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><path d=\"m8.25 12.25 2.5 2.5 5-5.25\"/>","close":"<path d=\"M6.5 6.5l11 11M17.5 6.5l-11 11\"/>","arrow-up-right":"<path d=\"M7.5 16.5 16.5 7.5M9 7.5h7.5V15\"/>"};
/* js/00-core.js */
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

/* js/01-model.js */
/* Navigation model: every destination this person is allowed to see, read
   from the sidebar the server rendered for them (so permissions are always
   respected), plus where the current page sits in that tree. */

var NAV = [];
var navEl = sidebar ? qs('nav.crm-nav-groups', sidebar) : null;

// Words people use for a place that its label does not contain.
var SYNONYMS = {
  overview: 'home dashboard start',
  leads: 'pipeline prospects opportunities deals merchants',
  customers: 'clients accounts',
  tasks: 'todo to do follow up',
  attention: 'overdue alerts at risk',
  'call-sheets': 'dialer calling phone start calling',
  conversations: 'email mail inbox',
  chat: 'messages team chat',
  notifications: 'alerts bell',
  appointments: 'meetings bookings',
  calendar: 'schedule availability',
  proposals: 'quotes estimates documents',
  invoices: 'billing payments invoice',
  contracts: 'agreements signatures',
  'time-tracking': 'clock in clock out timesheet hours pay',
  commissions: 'earnings pay',
  leaderboard: 'rankings scores',
  reports: 'analytics stats',
  team: 'employees users permissions staff people',
  'team-directory': 'employees staff people',
  billing: 'subscription plan seats upgrade',
  integrations: 'connections apps google quickbooks',
  data: 'import export csv',
  import: 'upload csv',
  trash: 'deleted restore recycle',
  help: 'support contact',
  canvass: 'map territory door knocking',
  field: 'today route',
  security: 'audit sessions passwords',
  branding: 'logo colors white label',
  automations: 'workflows triggers rules',
  ai: 'assistant forever ai',
  'my-account': 'profile settings preferences account'
};

// Pages that live under another page in the menu (e.g. a single lead).
var PARENT_TAB = { lead: 'leads', search: null, customer: 'customers', project: 'my-jobs', job: 'my-jobs' };

(function buildNav() {
  if (!navEl) return;
  qsa('details.crm-nav-group', navEl).forEach(function (group, groupIndex) {
    var groupLabel = labelOf(qs(':scope > summary', group));
    qsa('a[href]', group).forEach(function (a) {
      var route = routeOf(a.getAttribute('href'));
      if (!route) return;
      var sub = a.closest('.crm-nav-subgroup');
      var area = sub ? labelOf(qs(':scope > summary', sub)) : '';
      NAV.push({
        label: labelOf(a),
        href: a.href,
        route: route,
        group: groupLabel,
        groupIndex: groupIndex,
        area: area,
        path: area ? groupLabel + ' › ' + area : groupLabel,
        link: a,
        subgroup: sub,
        groupEl: group,
        keywords: SYNONYMS[route.tab] || ''
      });
    });
  });
})();

/** The nav entry for this page, or the closest parent entry. */
var HERE = (function locate() {
  var exact = NAV.filter(function (n) { return n.link.getAttribute('aria-current') === 'page'; })[0];
  if (exact) return { entry: exact, exact: true };

  // Same tab: choose the entry whose parameters all match this URL.
  var here = routeOf(location.href);
  var best = null, bestScore = -1;
  NAV.forEach(function (n) {
    if (n.route.tab !== here.tab) return;
    var score = 0, ok = true;
    n.route.params.forEach(function (value, key) {
      if (key === 'tab') return;
      if (here.params.get(key) === value) score += 1; else ok = false;
    });
    if (ok && score > bestScore) { best = n; bestScore = score; }
  });
  if (best) return { entry: best, exact: bestScore === countParams(here.params) - 1 };

  var parentTab = PARENT_TAB[here.tab];
  if (parentTab) {
    var parent = NAV.filter(function (n) { return n.route.tab === parentTab && n.route.params.toString() === 'tab=' + parentTab; })[0] ||
      NAV.filter(function (n) { return n.route.tab === parentTab; })[0];
    if (parent) return { entry: parent, exact: false };
  }
  return null;
})();

function countParams(p) { var c = 0; p.forEach(function () { c += 1; }); return c; }

var pageTitle = (function () {
  var h1 = qs('main > header h1', app);
  return h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : (HERE ? HERE.entry.label : doc.title);
})();

/** Icon for a nav entry, matching the symbols used in the sidebar. */
function iconFor(entry) {
  if (!entry) return 'circle';
  var key = entry.route.tab;
  var map = {
    overview: 'house', leads: 'people', customers: 'heart', tasks: 'checklist', attention: 'warning',
    'call-sheets': 'phone', conversations: 'envelope', chat: 'message', notifications: 'bell',
    appointments: 'calendar', calendar: 'calendar', 'scheduler-pages': 'calendar',
    proposals: 'doc', invoices: 'doc', contracts: 'doc', recurring: 'clock',
    leaderboard: 'chart', reports: 'chart', forecast: 'chart', 'seo-analytics': 'chart',
    'time-tracking': 'clock', commissions: 'dollar', bonuses: 'dollar',
    'manager-center': 'gauge', 'manager-call-center': 'headset', 'integration-health': 'gauge',
    resources: 'book', tickets: 'help', help: 'help', ai: 'sparkles', forms: 'checklist', 'saved-views': 'star', suite: 'grid',
    'field-mode': 'mappin', field: 'mappin', canvass: 'map', 'field-routes': 'map',
    'my-jobs': 'briefcase', 'job-assignment': 'briefcase', 'customer-portal': 'heart', operations: 'box',
    'customer-lifecycle': 'heart', profitability: 'chart', 'vendor-portal': 'building', 'partner-portal': 'building',
    'customer-operations': 'box', 'my-account': 'person', 'workspace-console': 'sliders', 'team-directory': 'team',
    'team-recruiting': 'team', team: 'team', groups: 'team', 'lead-routing': 'people',
    'discount-codes': 'tag', 'commission-plans': 'dollar', pipelines: 'sliders', fields: 'sliders', approvals: 'check-circle',
    'lead-capture': 'bolt', 'sales-playbook': 'book', 'communications-settings': 'envelope', 'call-center-setup': 'headset',
    'call-scripts': 'doc', 'contact-center': 'phone', 'scheduler-admin': 'calendar', 'payroll-admin': 'banknote',
    accounting: 'banknote', 'vendor-bills': 'banknote', 'vendor-directory': 'building', products: 'box',
    gamification: 'star', automations: 'bolt', workflows: 'bolt', 'dashboard-builder': 'grid', 'ai-access': 'sparkles',
    'projects-settings': 'wrench', 'industry-builder': 'wrench', billing: 'creditcard', 'experience-settings': 'sliders',
    'business-modules': 'grid', 'guided-setup': 'check-circle', setup: 'book', branding: 'sparkles',
    integrations: 'link', 'seo-analytics-setup': 'chart', security: 'lock', data: 'archive', trash: 'archive'
  };
  return map[key] || 'circle';
}

/* js/02-sidebar.js */
/* Sidebar navigation, rebuilt from the links the server rendered for this
   person (so permissions and the workspace's module settings still decide
   what appears):

     Search ⌘K
     Pinned            pages you starred
     Everyday pages    Dashboard, Leads, Customers, Tasks, Calls, Inbox …
     Sections          everything else, one collapsible group per area
     Settings ›        workspace administration, in its own panel

   Administration (50+ pages) lives in a second panel that slides in, so it
   never buries the pages people use every day. On a settings page the
   sidebar opens on that panel. */

// Everyday destinations, in the order they appear. Shorter labels where the
// server's label is a sentence; the full label stays as the tooltip.
var EVERYDAY = [
  { tab: 'overview', icon: 'house' },
  { tab: 'attention', icon: 'warning' },
  { tab: 'leads', icon: 'people' },
  { tab: 'customers', icon: 'heart' },
  { tab: 'tasks', icon: 'checklist' },
  { tab: 'call-sheets', view: 'call_view=my-calls', icon: 'phone', label: 'Calls' },
  { tab: 'conversations', icon: 'envelope' },
  { tab: 'chat', icon: 'message' },
  { tab: 'calendar', icon: 'calendar' }
];

var sidePanels = null;

function setupSidebar() {
  if (!sidebar || !navEl) return;

  // Groups: personal account (→ account menu), administration (→ Settings
  // panel), and the rest (→ main panel).
  var groups = qsa('details.crm-nav-group', navEl);
  var accountGroup = groups.filter(function (g) {
    var links = qsa('a[href]', g);
    return links.length && links.every(function (a) { return /[?&]account_view=/.test(a.getAttribute('href') || ''); });
  })[0];
  var adminGroup = groups.filter(function (g) {
    return g !== accountGroup && (/workspace management|administration|settings/i.test(labelOf(qs(':scope > summary', g))) ||
      !!qs('a[href$="tab=workspace-console"], a[href$="tab=billing"]', g));
  })[0];
  var accountLinks = accountGroup ? qsa('a[href]', accountGroup) : [];

  var entries = NAV.filter(function (n) { return n.groupEl !== accountGroup; });
  var adminEntries = entries.filter(function (n) { return n.groupEl === adminGroup; });
  var appEntries = entries.filter(function (n) { return n.groupEl !== adminGroup; });

  // Everyday list
  var used = [];
  var everyday = [];
  EVERYDAY.forEach(function (spec) {
    var match = appEntries.filter(function (n) {
      if (n.route.tab !== spec.tab || used.indexOf(n) !== -1) return false;
      return spec.view ? n.route.params.toString().indexOf(spec.view) !== -1 : true;
    })[0];
    if (!match) return;
    used.push(match);
    everyday.push({ entry: match, icon: spec.icon, label: spec.label || match.label });
  });

  // Sections: the remaining app pages grouped by their area.
  var sections = [];
  appEntries.forEach(function (n) {
    if (used.indexOf(n) !== -1) return;
    var name = n.area || n.group;
    var section = sections.filter(function (s) { return s.name === name; })[0];
    if (!section) { section = { name: name, entries: [] }; sections.push(section); }
    section.entries.push(n);
  });

  // Settings sections, in server order.
  var adminSections = [];
  adminEntries.forEach(function (n) {
    var name = n.area || n.group;
    var section = adminSections.filter(function (s) { return s.name === name; })[0];
    if (!section) { section = { name: name, entries: [] }; adminSections.push(section); }
    section.entries.push(n);
  });

  var inSettings = !!(HERE && adminEntries.indexOf(HERE.entry) !== -1);

  var mainPanel = el('div', { class: 'fx-panel', id: 'fx-panel-main', role: 'navigation', 'aria-label': 'Main' });
  var settingsPanel = el('div', { class: 'fx-panel', id: 'fx-panel-settings', role: 'navigation', 'aria-label': 'Settings' });

  // Main panel
  var pinsBox = el('div', { class: 'fx-pins' });
  mainPanel.appendChild(pinsBox);
  mainPanel.appendChild(el('ul', { class: 'fx-list fx-everyday' }, everyday.map(function (item) {
    return el('li', {}, [navItem(item.entry, item.label, item.icon)]);
  })));
  var openState = store.get('open-sections', {});
  sections.forEach(function (section, i) {
    mainPanel.appendChild(navSection(section, 'm' + i, openState));
  });
  if (adminEntries.length) {
    var toSettings = el('button', { type: 'button', class: 'fx-item fx-to-settings', 'aria-controls': 'fx-panel-settings' },
      [icon('sliders', 'fx-item-icon'), el('span', { class: 'fx-item-label', text: 'Settings' }), icon('chevron-right', 'fx-item-end')]);
    toSettings.addEventListener('click', function () { showPanel('settings', true); });
    mainPanel.appendChild(el('ul', { class: 'fx-list fx-settings-link' }, [el('li', {}, [toSettings])]));
  }

  // Settings panel
  var back = el('button', { type: 'button', class: 'fx-panel-back', 'aria-controls': 'fx-panel-main' }, [icon('chevron-left'), 'Main menu']);
  back.addEventListener('click', function () { showPanel('main', true); });
  settingsPanel.appendChild(back);
  settingsPanel.appendChild(el('h2', { class: 'fx-panel-title', text: 'Settings' }));
  adminSections.forEach(function (section) {
    settingsPanel.appendChild(el('h3', { class: 'fx-heading', text: section.name }));
    settingsPanel.appendChild(el('ul', { class: 'fx-list' }, section.entries.map(function (n) {
      return el('li', {}, [navItem(n, n.label)]);
    })));
  });

  sidePanels = el('div', { class: 'fx-panels', 'data-panel': inSettings ? 'settings' : 'main' }, [mainPanel, settingsPanel]);
  navEl.parentNode.insertBefore(sidePanels, navEl);
  showPanel(inSettings ? 'settings' : 'main', false);

  renderPins();
  buildSideSearch();
  buildSidebarFooter(accountLinks);

  // Bring the current page into view.
  var current = qs('.fx-panel:not([hidden]) [aria-current="page"]', sidePanels);
  if (current) {
    var panel = current.closest('.fx-panel');
    if (current.offsetTop > panel.clientHeight - 80) panel.scrollTop = current.offsetTop - panel.clientHeight / 3;
  }
  setupOverlay();
}

/** One page link in the sidebar. */
function navItem(entry, label, iconName) {
  var isHere = !!(HERE && HERE.entry === entry);
  var a = el('a', { class: 'fx-item', href: entry.href, title: entry.label !== label ? entry.label : null,
    'aria-current': isHere ? 'page' : null, 'data-key': entry.route.params.toString() }, [
    iconName ? icon(iconName, 'fx-item-icon') : null,
    el('span', { class: 'fx-item-label', text: label })
  ]);
  var pin = el('button', { type: 'button', class: 'fx-pin', 'aria-pressed': isPinned(entry) ? 'true' : 'false' }, [icon('star')]);
  pin.setAttribute('aria-label', (isPinned(entry) ? 'Unpin ' : 'Pin ') + label);
  pin.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    togglePin(entry);
  });
  a.appendChild(pin);
  return a;
}

/** A collapsible group of pages. Open when it holds the current page or
 *  when the person left it open; otherwise closed. */
function navSection(section, id, openState) {
  var holdsHere = section.entries.some(function (n) { return HERE && HERE.entry === n; });
  var open = holdsHere || openState[section.name] === true;
  var listId = 'fx-sec-' + id;
  var head = el('button', { type: 'button', class: 'fx-heading fx-toggle', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': listId },
    [el('span', { text: section.name }), icon('chevron-right', 'fx-toggle-chev')]);
  var list = el('ul', { class: 'fx-list', id: listId, hidden: !open }, section.entries.map(function (n) {
    return el('li', {}, [navItem(n, n.label)]);
  }));
  head.addEventListener('click', function () {
    var nowOpen = head.getAttribute('aria-expanded') !== 'true';
    head.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
    list.hidden = !nowOpen;
    var state = store.get('open-sections', {});
    state[section.name] = nowOpen;
    store.set('open-sections', state);
  });
  return el('div', { class: 'fx-section' }, [head, list]);
}

function showPanel(name, focus) {
  if (!sidePanels) return;
  sidePanels.setAttribute('data-panel', name);
  qsa(':scope > .fx-panel', sidePanels).forEach(function (p) {
    var active = p.id === 'fx-panel-' + name;
    p.hidden = false;
    p.inert = !active;
    p.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  if (focus) {
    var target = name === 'settings' ? qs('.fx-panel-back', sidePanels) : qs('.fx-to-settings', sidePanels);
    if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 30);
  }
}

/* Pinned pages: stored per workspace, shown at the top of the main panel. */
function pinKeys() { return store.get('pins', []); }
function isPinned(entry) { return pinKeys().indexOf(entry.route.params.toString()) !== -1; }
function togglePin(entry) {
  var key = entry.route.params.toString();
  var keys = pinKeys();
  var i = keys.indexOf(key);
  if (i === -1) keys.push(key); else keys.splice(i, 1);
  store.set('pins', keys);
  qsa('.fx-item[data-key="' + key.replace(/"/g, '\\"') + '"] .fx-pin', sidePanels).forEach(function (b) {
    var on = i === -1;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', (on ? 'Unpin ' : 'Pin ') + entry.label);
  });
  renderPins();
}
function renderPins() {
  var box = qs('.fx-pins', sidePanels);
  if (!box) return;
  box.textContent = '';
  var pinned = pinKeys().map(function (key) {
    return NAV.filter(function (n) { return n.route.params.toString() === key; })[0];
  }).filter(Boolean);
  if (!pinned.length) return;
  box.appendChild(el('h3', { class: 'fx-heading', text: 'Pinned' }));
  box.appendChild(el('ul', { class: 'fx-list' }, pinned.map(function (n) {
    return el('li', {}, [navItem(n, n.label, 'star')]);
  })));
}

/* The search field at the top opens Search or jump to (one search for
   pages, actions and records). */
function buildSideSearch() {
  var label = qs(':scope > .eyebrow', sidebar);
  var button = el('button', { type: 'button', class: 'fx-side-search', 'aria-haspopup': 'dialog' },
    [icon('search'), el('span', { text: 'Search' }), el('kbd', { text: MOD_LABEL + ' K' })]);
  button.setAttribute('aria-label', 'Search or jump to');
  button.addEventListener('click', function () { openPalette(''); });
  if (label) label.parentNode.insertBefore(button, label);
  else sidebar.insertBefore(button, sidePanels);
}

function buildSidebarFooter(accountLinks) {
  var bottom = qs('.aside-bottom', sidebar);
  if (!bottom) return;
  var nameNode = qs(':scope > strong', bottom);
  var roleNode = qs(':scope > small', bottom);
  var logout = qs(':scope > a[href*="logout"]', bottom) || qs('.session-logout');
  var name = nameNode ? nameNode.textContent.trim() : '';
  var role = roleNode ? roleNode.textContent.trim() : '';
  var emailNode = qs('.session-bar > span strong', main);
  var email = emailNode ? emailNode.textContent.trim() : '';
  var initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '•';

  // Help & support, from the strip that used to sit at the top of every page.
  var strip = qs('.crm-contact-strip', main);
  var supportLink = strip ? qsa('a[href]', strip).filter(function (a) { return !/^tel:/i.test(a.getAttribute('href')); })[0] : null;
  var callLink = strip ? qs('a[href^="tel:"]', strip) : null;
  if (supportLink || callLink) {
    var help = el('div', { class: 'fx-help-row' });
    if (supportLink) help.appendChild(el('a', { href: supportLink.href }, [icon('help'), 'Help & support']));
    if (callLink) help.appendChild(el('a', { href: callLink.getAttribute('href'), title: callLink.textContent.trim() }, [icon('phone'), callLink.textContent.replace(/^call\s*/i, '').trim() || 'Call support']));
    bottom.insertBefore(help, bottom.firstChild);
  }

  var menuId = 'fx-account-menu';
  var button = el('button', {
    type: 'button', class: 'fx-account', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': menuId
  }, [
    el('span', { class: 'fx-avatar', 'aria-hidden': 'true', text: initials }),
    el('span', { class: 'fx-account-text' }, [el('strong', { text: name || 'My account' }), role ? el('small', { text: role }) : null]),
    icon('chevron-updown')
  ]);
  button.setAttribute('aria-label', (name ? name + ', ' : '') + 'account menu');
  bottom.appendChild(button);

  var items = [el('div', { class: 'fx-menu-head' }, [el('strong', { text: name || 'Signed in' }), email ? el('small', { text: email }) : (role ? el('small', { text: role }) : null)])];
  if (accountLinks.length) {
    items.push(el('div', { class: 'fx-menu-label', text: 'My account' }));
    accountLinks.forEach(function (a) {
      var item = el('a', { href: a.href, role: 'menuitem', 'aria-current': a.getAttribute('aria-current') }, [icon(menuIconFor(a.getAttribute('href'))), labelOf(a)]);
      items.push(item);
    });
    items.push(el('div', { class: 'fx-menu-sep', role: 'separator' }));
  }
  var shortcutsItem = el('button', { type: 'button', role: 'menuitem' }, [icon('keyboard'), 'Keyboard shortcuts']);
  shortcutsItem.addEventListener('click', function () { closeMenu(); openShortcuts(); });
  items.push(shortcutsItem);
  if (supportLink) items.push(el('a', { href: supportLink.href, role: 'menuitem' }, [icon('help'), 'Help & support']));
  if (logout) {
    items.push(el('div', { class: 'fx-menu-sep', role: 'separator' }));
    items.push(el('a', { href: logout.href, role: 'menuitem' }, [icon('logout'), 'Log out']));
  }
  var menu = el('div', { class: 'fx-menu', id: menuId, role: 'menu', 'aria-label': 'Account', hidden: true }, items);
  doc.body.appendChild(menu);

  function place() {
    var r = button.getBoundingClientRect();
    menu.style.left = Math.max(8, r.left) + 'px';
    menu.style.width = Math.max(248, r.width) + 'px';
    menu.style.bottom = (window.innerHeight - r.top + 6) + 'px';
    menu.style.top = 'auto';
  }
  function menuItems() { return qsa('[role="menuitem"]', menu); }
  function openMenu() {
    place();
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    var first = menuItems()[0];
    if (first) first.focus();
  }
  function closeMenu(returnFocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }
  button.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(); });
  menu.addEventListener('keydown', function (e) { menuKeys(e, menuItems(), function () { closeMenu(true); }); });
  doc.addEventListener('click', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) closeMenu();
  });
  window.addEventListener('resize', function () { if (!menu.hidden) place(); });
  registerEscape(function () { if (!menu.hidden) { closeMenu(true); return true; } return false; });
}

function menuIconFor(href) {
  var view = (/account_view=([a-z-]+)/.exec(href || '') || [])[1] || '';
  return ({ profile: 'person', connections: 'link', calendar: 'calendar', email: 'envelope', notifications: 'bell',
    preferences: 'sliders', app: 'phone-device', security: 'lock' })[view] || 'person';
}

/** Arrow-key movement for simple menus. */
function menuKeys(e, items, close) {
  var i = items.indexOf(doc.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
  else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
  else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  else if (e.key === 'Tab') close();
}

/* Tablet and phone: the sidebar slides over the page. Close it from the
   backdrop or Escape, and move focus in and out with it. */
var sidebarOpener = null;
function setupOverlay() {
  sidebar.setAttribute('tabindex', '-1');
  var wasOpen = doc.body.classList.contains('crm-sidebar-open');
  new MutationObserver(function () {
    var isOpen = doc.body.classList.contains('crm-sidebar-open');
    if (isOpen === wasOpen) return;
    wasOpen = isOpen;
    if (isOpen) {
      sidebarOpener = doc.activeElement;
      sidebar.focus({ preventScroll: true });
      var here = sidePanels && qs('.fx-panel[aria-hidden="false"] [aria-current="page"]', sidePanels);
      if (here) here.scrollIntoView({ block: 'center' });
    } else if (sidebarOpener && sidebarOpener.focus && doc.contains(sidebarOpener)) {
      sidebarOpener.focus({ preventScroll: true });
    }
    syncSidebarButton();
  }).observe(doc.body, { attributes: true, attributeFilter: ['class'] });

  // The dimmed backdrop is the body's ::after, so a click on it lands on body.
  doc.addEventListener('click', function (e) {
    if (doc.body.classList.contains('crm-sidebar-open') && (e.target === doc.body || e.target === root)) {
      doc.body.classList.remove('crm-sidebar-open');
    }
  });
  registerEscape(function () {
    if (!desktop.matches && doc.body.classList.contains('crm-sidebar-open')) {
      doc.body.classList.remove('crm-sidebar-open');
      return true;
    }
    return false;
  });
  desktop.addEventListener('change', function (m) { if (m.matches) doc.body.classList.remove('crm-sidebar-open'); });
}

/* js/03-toolbar.js */
/* Toolbar: sidebar toggle, back, where-you-are, search, inbox, alerts and
   quick actions in one pinned bar. Existing controls are moved, not copied,
   so every handler the CRM already attached keeps working. */

var toolbar = null;
var sidebarButton = null;
var legacySidebarToggle = qs('[data-sidebar-toggle]', main);

function setupToolbar() {
  var header = qs(':scope > header', main);
  var commandWrap = header ? qs('.crm-command-wrap', header) : qs('.crm-command-wrap', main);
  var back = qs('.session-bar [data-crm-page-back]', main);

  toolbar = el('div', { class: 'fx-toolbar' });
  var lead = el('div', { class: 'fx-toolbar-lead' });
  var trail = el('div', { class: 'fx-toolbar-trail' });

  // Sidebar toggle
  if (sidebar) {
    sidebarButton = el('button', {
      type: 'button', class: 'fx-tool fx-sidebar-btn', 'aria-controls': 'forever-crm-sidebar',
      'aria-keyshortcuts': isApple ? 'Meta+\\' : 'Control+\\'
    }, [icon('sidebar')]);
    sidebarButton.addEventListener('click', toggleSidebar);
    lead.appendChild(sidebarButton);
  }

  // Back, labelled with where it goes when we know ("‹ Leads").
  if (back) {
    var destination = previousPageLabel();
    back.textContent = '';
    back.appendChild(el('span', { class: 'fx-back-label', text: destination || 'Back' }));
    back.setAttribute('aria-label', destination ? 'Back to ' + destination : 'Back');
    lead.appendChild(back);
  }

  // Where you are
  var slot = el('div', { class: 'fx-title-slot' });
  var crumbs = buildCrumbs();
  if (crumbs) slot.appendChild(crumbs);
  slot.appendChild(el('div', { class: 'fx-compact-title', 'aria-hidden': 'true', text: pageTitle }));
  lead.appendChild(slot);

  // Search
  var trigger = el('button', {
    type: 'button', class: 'fx-search-trigger', 'aria-haspopup': 'dialog',
    'aria-keyshortcuts': isApple ? 'Meta+K' : 'Control+K'
  }, [icon('search'), el('span', { class: 'fx-search-label', text: 'Search or jump to…' }), el('kbd', { text: MOD_LABEL + ' K' })]);
  trigger.setAttribute('aria-label', 'Search or jump to');
  trigger.addEventListener('click', function () { openPalette(''); });
  trail.appendChild(trigger);

  if (commandWrap) {
    trail.appendChild(commandWrap);
    setupQuickMenu(commandWrap);
  }

  // Dashboard: today's date above the large title, as in Apple's Today views.
  var titleBlock = header ? qs(':scope > div:first-child', header) : null;
  var h1 = titleBlock ? qs('h1', titleBlock) : null;
  if (h1 && currentTab === 'overview') {
    var date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    titleBlock.insertBefore(el('span', { class: 'fx-dateline', text: date }), h1);
  }

  toolbar.appendChild(lead);
  toolbar.appendChild(trail);
  main.insertBefore(toolbar, main.firstChild);

  syncSidebarButton();
  watchScroll();
}

/** Group › Area (› Parent page when this page is a child of a menu page). */
function buildCrumbs() {
  if (!HERE) return null;
  var e = HERE.entry;
  var items = [el('li', { text: e.group })];
  if (e.area) items.push(el('li', { text: e.area }));
  if (!HERE.exact && norm(e.label) !== norm(pageTitle)) {
    items.push(el('li', {}, [el('a', { href: e.href, text: e.label })]));
  }
  return el('nav', { class: 'fx-crumbs', 'aria-label': 'You are here' }, [el('ol', {}, items)]);
}

/** Label of the page the Back button returns to, from internal-back.js history. */
function previousPageLabel() {
  try {
    var stack = JSON.parse(sessionStorage.getItem('fagcrm:internal-back-stack:v1') || '[]');
    var here = routeOf(location.href);
    for (var i = stack.length - 1; i >= 0; i -= 1) {
      var r = routeOf(stack[i]);
      if (!r || (here && r.params.toString() === here.params.toString())) continue;
      var match = NAV.filter(function (n) { return n.route.params.toString() === r.params.toString(); })[0] ||
        NAV.filter(function (n) { return n.route.tab === r.tab; })[0];
      return match ? match.label : '';
    }
  } catch (e) { /* no history */ }
  return '';
}

function isSidebarShown() {
  if (desktop.matches) return !app.classList.contains('sidebar-hidden');
  return doc.body.classList.contains('crm-sidebar-open');
}

function toggleSidebar() {
  if (desktop.matches) {
    if (legacySidebarToggle) legacySidebarToggle.click();   // keeps the saved preference in sync
    else app.classList.toggle('sidebar-hidden');
  } else {
    doc.body.classList.toggle('crm-sidebar-open');
  }
  syncSidebarButton();
}

function syncSidebarButton() {
  if (!sidebarButton) return;
  var shown = isSidebarShown();
  sidebarButton.setAttribute('aria-expanded', shown ? 'true' : 'false');
  sidebarButton.setAttribute('aria-label', shown ? 'Hide sidebar' : 'Show sidebar');
  sidebarButton.title = (shown ? 'Hide sidebar' : 'Show sidebar') + ' (' + MOD_LABEL + '\\)';
}

/* Quick actions: label, menu semantics, keyboard. */
function setupQuickMenu(wrap) {
  var toggle = qs('[data-quick-toggle]', wrap);
  var menu = qs('[data-quick-menu]', wrap);
  if (!toggle || !menu) return;
  menu.id = menu.id || 'fx-quick-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Quick actions');
  qsa('a', menu).forEach(function (a) {
    a.setAttribute('role', 'menuitem');
    a.textContent = a.textContent.replace(/^\s*\+\s*/, '');
  });
  toggle.textContent = '';
  toggle.appendChild(icon('plus', 'fx-plus'));
  toggle.appendChild(el('span', { class: 'fx-quick-label', text: 'New' }));
  toggle.setAttribute('aria-label', 'Quick actions');
  toggle.setAttribute('aria-haspopup', 'menu');
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.title = 'Quick actions';

  var items = function () { return qsa('[role="menuitem"]', menu); };
  new MutationObserver(function () {
    var open = !menu.hidden;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var first = items()[0]; if (first) first.focus(); }
  }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
  menu.addEventListener('keydown', function (e) {
    menuKeys(e, items(), function () { menu.hidden = true; toggle.focus(); });
  });
  registerEscape(function () {
    if (!menu.hidden) { menu.hidden = true; toggle.focus(); return true; }
    return false;
  });
}

/* Hairline once content scrolls under the toolbar; compact title once the
   large title has scrolled away. */
function watchScroll() {
  var ticking = false;
  function update() {
    ticking = false;
    toolbar.classList.toggle('is-stuck', (window.scrollY || root.scrollTop) > 2);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  var h1 = qs(':scope > header h1', main);
  if (h1 && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      var above = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      toolbar.classList.toggle('has-compact-title', above);
    }, { rootMargin: '-' + (toolbar.offsetHeight || 56) + 'px 0px 0px 0px', threshold: 0 }).observe(h1);
  }
}

/* js/04-palette.js */
/* Search or jump to (⌘K / Ctrl+K / "/"): one field for every page you can
   open, the quick actions, your recent pages, and a search of the records
   themselves. Runs the CRM's own record search, so results are permission
   checked by the server as before. */

var palette = null;
var paletteState = { items: [], active: 0, opener: null };
var RECENT_MAX = 8;

function recordVisit() {
  var here = routeOf(location.href);
  if (!here || here.tab === 'search') return;
  var path = HERE ? HERE.entry.path : '';
  var entry = { label: pageTitle, path: path, href: location.href.replace(/([?&])notice=[^&]*&?/, '$1').replace(/[?&]$/, ''),
    key: here.params.toString(), icon: iconFor(HERE && HERE.entry) };
  var list = store.get('recent', []).filter(function (r) { return r && r.key !== entry.key; });
  list.unshift(entry);
  store.set('recent', list.slice(0, RECENT_MAX));
}

function quickActions() {
  var seen = {};
  var actions = [];
  qsa('.crm-quick-menu a[href]').forEach(function (a) {
    var label = a.textContent.replace(/^\s*\+\s*/, '').trim();
    if (!label || seen[norm(label)]) return;
    seen[norm(label)] = 1;
    actions.push({ kind: 'action', label: label, sub: 'Quick action', href: a.href, icon: /lead|contact/i.test(label) ? 'people' : /task/i.test(label) ? 'checklist' : /appointment/i.test(label) ? 'calendar' : /ticket/i.test(label) ? 'help' : 'plus' });
  });
  var mobile = window.FAGCRM_MOBILE && window.FAGCRM_MOBILE.quick;
  (Array.isArray(mobile) ? mobile : []).forEach(function (q) {
    var label = String(q.label || '').trim();
    if (!label || !q.url || seen[norm(label)]) return;
    seen[norm(label)] = 1;
    actions.push({ kind: 'action', label: label, sub: 'Quick action', href: q.url, icon: 'plus' });
  });
  return actions;
}

function commandItems() {
  var list = [];
  if (sidebar) list.push({ kind: 'command', label: 'Show or hide sidebar', sub: MOD_LABEL + ' \\', icon: 'sidebar', run: toggleSidebar });
  list.push({ kind: 'command', label: 'Keyboard shortcuts', sub: '?', icon: 'keyboard', run: openShortcuts });
  var support = qs('.fx-help-row a[href]:not([href^="tel:"])', sidebar || doc);
  if (support) list.push({ kind: 'command', label: 'Help & support', sub: 'Contact My Forever CRM support', icon: 'help', href: support.href, keywords: 'contact phone call' });
  return list;
}

/* Scoring: whole label > label prefix > every word starts a label word >
   words found across label, area and synonyms > letters in order. */
function score(item, q, words) {
  var label = norm(item.label);
  var hay = ' ' + label + ' ' + norm((item.sub || '') + ' ' + (item.keywords || '')) + ' ';
  if (label === q) return 100;
  if (label.indexOf(q) === 0) return 85;
  var labelWords = ' ' + label;
  if (words.every(function (w) { return labelWords.indexOf(' ' + w) !== -1; })) return 70;
  if (words.every(function (w) { return hay.indexOf(' ' + w) !== -1; })) return 50;
  if (words.every(function (w) { return hay.indexOf(w) !== -1; })) return 30;
  // letters in order (e.g. "cmp" -> "Commission plans")
  var i = 0;
  for (var c = 0; c < label.length && i < q.length; c += 1) if (label[c] === q[i]) i += 1;
  return i === q.length && q.length > 2 ? 10 : 0;
}

function buildResults(raw) {
  var q = norm(raw);
  var groups = [];
  var pages = NAV.filter(function (n) { return !n.link.closest('.crm-favorites-group'); }).map(function (n) {
    return { kind: 'page', label: n.label, sub: n.path, href: n.href, icon: iconFor(n), keywords: n.keywords + ' ' + n.area,
      current: HERE && HERE.exact && HERE.entry === n };
  });
  var actions = quickActions();
  var commands = commandItems();

  if (!q) {
    var recent = store.get('recent', []).filter(function (r) { return r && r.href && r.key !== (routeOf(location.href) || {}).params.toString(); }).slice(0, 5)
      .map(function (r) { return { kind: 'page', label: r.label, sub: r.path || 'Recently viewed', href: r.href, icon: r.icon || 'clock' }; });
    if (recent.length) groups.push({ title: 'Recent', items: recent });
    var favs = store.get('pins', []).map(function (key) {
      var n = NAV.filter(function (x) { return x.route.params.toString() === key; })[0];
      return n ? { kind: 'page', label: n.label, sub: n.path, href: n.href, icon: 'star' } : null;
    }).filter(Boolean);
    if (favs.length) groups.push({ title: 'Pinned', items: favs.slice(0, 6) });
    if (actions.length) groups.push({ title: 'Quick actions', items: actions.slice(0, 6) });
    var suggested = ['overview', 'leads', 'customers', 'tasks', 'calendar', 'conversations'].map(function (tab) {
      return pages.filter(function (p) { var r = routeOf(p.href); return r && r.tab === tab; })[0];
    }).filter(Boolean);
    if (suggested.length) groups.push({ title: 'Go to', items: suggested });
    return groups;
  }

  var words = q.split(' ');
  function ranked(list) {
    return list.map(function (item) { return { item: item, s: score(item, q, words) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });
  }
  var rankedPages = ranked(pages);
  var rankedActions = ranked(actions.concat(commands));
  var best = Math.max(rankedPages.length ? rankedPages[0].s : 0, rankedActions.length ? rankedActions[0].s : 0);

  var searchRow = { kind: 'search', label: 'Search records for “' + raw.trim() + '”', sub: 'Leads, customers, tasks and more', icon: 'search', query: raw.trim() };
  var searchAvailable = !!qs('#crm-command-search');
  // A name or phone number rarely matches a page: put record search first.
  if (searchAvailable && best < 70) groups.push({ title: 'Records', items: [searchRow] });
  if (rankedPages.length) groups.push({ title: 'Pages', items: rankedPages.slice(0, 12).map(function (x) { return x.item; }) });
  if (rankedActions.length) groups.push({ title: 'Actions', items: rankedActions.slice(0, 6).map(function (x) { return x.item; }) });
  if (searchAvailable && best >= 70) groups.push({ title: 'Records', items: [searchRow] });
  return groups;
}

function ensurePalette() {
  if (palette) return palette;
  var input = el('input', {
    type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'fx-palette-list',
    'aria-autocomplete': 'list', 'aria-label': 'Search or jump to', placeholder: 'Search or jump to…',
    autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'go'
  });
  var list = el('div', { class: 'fx-palette-list', id: 'fx-palette-list', role: 'listbox', 'aria-label': 'Results' });
  var foot = el('div', { class: 'fx-palette-foot', 'aria-hidden': 'true' }, [
    el('span', {}, [el('kbd', { text: '↑' }), el('kbd', { text: '↓' }), ' to move']),
    el('span', {}, [el('kbd', { text: '↵' }), ' to open']),
    el('span', {}, [el('kbd', { text: 'esc' }), ' to close'])
  ]);
  var panel = el('div', { class: 'fx-palette-panel' }, [
    el('div', { class: 'fx-palette-field' }, [icon('search'), input]), list, foot
  ]);
  var backdrop = el('div', { class: 'fx-palette-backdrop' });
  palette = el('div', { class: 'fx-palette', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search or jump to', hidden: true }, [backdrop, panel]);
  doc.body.appendChild(palette);

  backdrop.addEventListener('click', closePalette);
  input.addEventListener('input', function () { renderPalette(input.value); });
  input.addEventListener('keydown', function (e) {
    var count = paletteState.items.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(count ? (paletteState.active + 1) % count : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(count ? (paletteState.active - 1 + count) % count : 0); }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); setActive(0); }
    else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); setActive(count - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); activate(paletteState.items[paletteState.active], e.metaKey || e.ctrlKey); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePalette(); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  });
  list.addEventListener('mousemove', function (e) {
    var option = e.target.closest('[role="option"]');
    if (option) setActive(Number(option.getAttribute('data-index')), true);
  });
  list.addEventListener('click', function (e) {
    var option = e.target.closest('[role="option"]');
    if (option) activate(paletteState.items[Number(option.getAttribute('data-index'))], e.metaKey || e.ctrlKey);
  });
  return palette;
}

function renderPalette(raw) {
  var list = qs('#fx-palette-list', palette);
  var input = qs('input', palette);
  var groups = buildResults(raw || '');
  list.textContent = '';
  paletteState.items = [];
  groups.forEach(function (group, g) {
    var headingId = 'fx-palette-h' + g;
    var box = el('div', { role: 'group', 'aria-labelledby': headingId });
    box.appendChild(el('div', { class: 'fx-palette-heading', id: headingId, text: group.title }));
    group.items.forEach(function (item) {
      var index = paletteState.items.length;
      paletteState.items.push(item);
      var title = el('span', { class: 'fx-palette-title' });
      title.appendChild(doc.createTextNode(item.label));
      var option = el('div', { class: 'fx-palette-item', role: 'option', id: 'fx-opt-' + index, 'data-index': String(index), 'aria-selected': 'false' }, [
        el('span', { class: 'fx-palette-icon', 'aria-hidden': 'true' }, [icon(item.icon || 'circle')]),
        el('span', { class: 'fx-palette-text' }, [title, item.sub ? el('span', { class: 'fx-palette-sub', text: item.sub }) : null]),
        item.current ? el('span', { class: 'fx-palette-hint', text: 'Current page' }) : null
      ]);
      box.appendChild(option);
    });
    list.appendChild(box);
  });
  if (!paletteState.items.length) {
    list.appendChild(el('div', { class: 'fx-palette-empty', role: 'status', text: 'No pages or actions match. Try a different word.' }));
  }
  setActive(0);
  input.setAttribute('aria-expanded', paletteState.items.length ? 'true' : 'false');
}

function setActive(index, fromPointer) {
  var options = qsa('[role="option"]', palette);
  if (!options.length) { qs('input', palette).removeAttribute('aria-activedescendant'); return; }
  paletteState.active = Math.max(0, Math.min(index, options.length - 1));
  options.forEach(function (o, i) { o.setAttribute('aria-selected', i === paletteState.active ? 'true' : 'false'); });
  var current = options[paletteState.active];
  qs('input', palette).setAttribute('aria-activedescendant', current.id);
  if (!fromPointer) current.scrollIntoView({ block: 'nearest' });
}

function activate(item, newTab) {
  if (!item) return;
  if (item.kind === 'search') {
    var field = qs('#crm-command-search');
    if (field && field.form) {
      field.value = item.query;
      closePalette(true);
      if (field.form.requestSubmit) field.form.requestSubmit(); else field.form.submit();
    }
    return;
  }
  if (item.run) { closePalette(true); item.run(); return; }
  if (item.href) {
    if (newTab) { window.open(item.href, '_blank', 'noopener'); return; }
    closePalette(true);
    location.href = item.href;
  }
}

function openPalette(query) {
  ensurePalette();
  if (!palette.hidden) { qs('input', palette).focus(); return; }
  paletteState.opener = doc.activeElement;
  var input = qs('input', palette);
  input.value = query || '';
  renderPalette(input.value);
  palette.hidden = false;
  doc.body.style.overflow = 'hidden';
  input.focus();
  input.select();
}

function closePalette(navigating) {
  if (!palette || palette.hidden) return;
  palette.hidden = true;
  doc.body.style.overflow = '';
  if (navigating !== true && paletteState.opener && paletteState.opener.focus && doc.contains(paletteState.opener)) {
    paletteState.opener.focus({ preventScroll: true });
  }
}

/* js/05-segmented.js */
/* View switchers: rows of links that switch between views of the same
   screen are marked as segmented controls (styled in 09-navigation.css)
   and the current view is announced as the current page. Rows that mix in
   other destinations or actions are left as buttons. */

function setupSegmented() {
  var candidates = qsa('main .actions, main .view-switch, main .resource-hero-actions, main nav.call-center-tabs, main nav.setup-center-tabs', app);
  candidates.forEach(function (box) {
    var children = Array.prototype.slice.call(box.children);
    var links = children.filter(function (c) { return c.tagName === 'A' && c.hasAttribute('href'); });
    if (links.length < 2) return;
    var isNav = box.matches('.view-switch, nav.call-center-tabs, nav.setup-center-tabs');
    if (!isNav) {
      // Every child must be a link to another view of this same screen.
      if (links.length !== children.length) return;
      var allViews = links.every(function (a) {
        var r = routeOf(a.getAttribute('href'));
        return r && r.tab === currentTab && /(^|&)[a-z_]*view=/.test(r.params.toString());
      });
      if (!allViews) return;
      box.classList.add('fx-segmented');
    }
    var current = links.filter(function (a) { return a.getAttribute('aria-current') === 'page'; })[0] ||
      links.filter(function (a) { return a.classList.contains('primary') && !a.classList.contains('call-center-upload-tab'); })[0];
    if (current) {
      current.setAttribute('aria-current', 'page');
      // Keep the current view visible when the control scrolls sideways.
      var hidden = current.offsetLeft < box.scrollLeft ||
        current.offsetLeft + current.offsetWidth > box.scrollLeft + box.clientWidth;
      if (box.scrollWidth > box.clientWidth && hidden) {
        box.scrollLeft = Math.max(0, current.offsetLeft - box.clientWidth / 2 + current.offsetWidth / 2);
      }
    }
    if (!box.getAttribute('aria-label') && box.tagName !== 'NAV') {
      box.setAttribute('role', 'navigation');
      box.setAttribute('aria-label', 'Views');
    }
  });
}

/* js/06-shortcuts.js */
/* Keyboard: ⌘K / Ctrl+K or "/" to search, ⌘\ to show or hide the sidebar,
   "G" then a letter to jump to a main page, "?" for the list, Esc to close
   whatever is open. Listens in the capture phase so the older single-key
   shortcuts never fire on top of these. */

var escapeHandlers = [];
function registerEscape(fn) { escapeHandlers.push(fn); }

var GO_KEYS = [
  ['h', 'overview', 'Dashboard'], ['l', 'leads', 'Leads'], ['c', 'customers', 'Customers'],
  ['t', 'tasks', 'Tasks'], ['k', 'calendar', 'Calendar'], ['i', 'conversations', 'Email inbox'],
  ['n', 'notifications', 'Notifications']
];
function goTarget(tab) {
  return NAV.filter(function (n) { return n.route.tab === tab && n.route.params.toString() === 'tab=' + tab; })[0] ||
    NAV.filter(function (n) { return n.route.tab === tab; })[0];
}

var pendingGo = 0;
function setupShortcuts() {
  window.addEventListener('keydown', function (e) {
    var typing = isTyping(e.target);
    var key = e.key || '';
    var mod = e.metaKey || e.ctrlKey;

    if (mod && !e.altKey && !e.shiftKey && key.toLowerCase() === 'k') {
      e.preventDefault(); e.stopImmediatePropagation();
      if (palette && !palette.hidden) closePalette(); else openPalette('');
      return;
    }
    if (mod && !e.altKey && key === '\\') {
      e.preventDefault(); e.stopImmediatePropagation();
      toggleSidebar();
      return;
    }
    if (key === 'Escape') {
      for (var i = escapeHandlers.length - 1; i >= 0; i -= 1) {
        if (escapeHandlers[i]()) { e.stopImmediatePropagation(); return; }
      }
      return;
    }
    if (typing || mod || e.altKey) return;

    if (pendingGo && Date.now() - pendingGo < 1200) {
      pendingGo = 0;
      var hit = GO_KEYS.filter(function (g) { return g[0] === key.toLowerCase(); })[0];
      var target = hit && goTarget(hit[1]);
      if (target) { e.preventDefault(); e.stopImmediatePropagation(); location.href = target.href; }
      return;
    }
    if (key === '/') { e.preventDefault(); e.stopImmediatePropagation(); openPalette(''); return; }
    if (key === '?') { e.preventDefault(); e.stopImmediatePropagation(); openShortcuts(); return; }
    if (key === 'g' || key === 'G') { pendingGo = Date.now(); e.stopImmediatePropagation(); }
  }, true);
}

var shortcutsDialog = null;
function openShortcuts() {
  if (!shortcutsDialog) {
    var rows = [
      ['Search or jump to', [MOD_LABEL, 'K']],
      ['Search (when not typing)', ['/']],
      ['Show or hide sidebar', [MOD_LABEL, '\\']]
    ];
    GO_KEYS.forEach(function (g) { if (goTarget(g[1])) rows.push(['Go to ' + g[2], ['G', g[0].toUpperCase()]]); });
    rows.push(['Show this list', ['?']], ['Close menus and dialogs', ['esc']]);
    var list = el('dl', { class: 'fx-keys' });
    rows.forEach(function (r) {
      list.appendChild(el('dt', { text: r[0] }));
      list.appendChild(el('dd', {}, r[1].map(function (k) { return el('kbd', { text: k }); })));
    });
    var close = el('button', { type: 'button', class: 'fx-dialog-close', 'aria-label': 'Close' }, [icon('close')]);
    var panel = el('div', { class: 'fx-dialog-panel' }, [el('h2', { id: 'fx-keys-title', text: 'Keyboard shortcuts' }), list, close]);
    shortcutsDialog = el('div', { class: 'fx-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fx-keys-title', hidden: true }, [
      el('div', { class: 'fx-palette-backdrop' }), panel
    ]);
    doc.body.appendChild(shortcutsDialog);
    shortcutsDialog.addEventListener('click', function (e) { if (e.target === shortcutsDialog || e.target.classList.contains('fx-palette-backdrop')) closeShortcuts(); });
    close.addEventListener('click', closeShortcuts);
    shortcutsDialog.addEventListener('keydown', function (e) { if (e.key === 'Tab') { e.preventDefault(); close.focus(); } });
    registerEscape(function () { if (!shortcutsDialog.hidden) { closeShortcuts(); return true; } return false; });
  }
  shortcutsDialog._opener = doc.activeElement;
  shortcutsDialog.hidden = false;
  qs('.fx-dialog-close', shortcutsDialog).focus();
}
function closeShortcuts() {
  if (!shortcutsDialog || shortcutsDialog.hidden) return;
  shortcutsDialog.hidden = true;
  var opener = shortcutsDialog._opener;
  if (opener && opener.focus && doc.contains(opener)) opener.focus({ preventScroll: true });
}

registerEscape(function () {
  if (palette && !palette.hidden) { closePalette(); return true; }
  return false;
});

/* js/99-boot.js */
/* Build the interface in one synchronous pass, then mark the document ready
   so the stylesheet swaps from its reserved layout to the real toolbar in
   the same frame. Each step is isolated: a failure in one leaves the rest,
   and the CRM itself, working. */

[setupToolbar, setupSidebar, setupSegmented, setupShortcuts, recordVisit].forEach(function (step) {
  try { step(); } catch (err) {
    if (window.console && console.warn) console.warn('[design-400] ' + (step.name || 'step') + ' failed', err);
  }
});
root.classList.add('fx-ready');

// Legacy scripts add pins and favourites on DOMContentLoaded; keep the
// sidebar button state in step with the saved preference they apply.
onReady(function () { try { syncSidebarButton(); } catch (e) { /* ignore */ } });

})();
