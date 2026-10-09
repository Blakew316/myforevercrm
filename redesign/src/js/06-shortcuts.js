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
