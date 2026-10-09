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
