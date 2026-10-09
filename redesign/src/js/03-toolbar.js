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
