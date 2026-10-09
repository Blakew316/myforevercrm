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
    var favs = qsa('.crm-favorites-group a[href]', navEl || doc).map(function (a) {
      var n = NAV.filter(function (x) { return x.href === a.href; })[0];
      return { kind: 'page', label: labelOf(a), sub: n ? n.path : 'Favorite', href: a.href, icon: 'star' };
    });
    if (favs.length) groups.push({ title: 'Favorites', items: favs.slice(0, 6) });
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
