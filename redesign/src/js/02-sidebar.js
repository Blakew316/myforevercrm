/* Sidebar: open only where you are, remember the sections you collapse,
   flatten one-page areas, find a page by typing, and keep the account,
   help and sign-out together in the footer. */

var sideSearchInput = null;

function setupSidebar() {
  if (!sidebar || !navEl) return;

  // 1. One-page areas become a single row (no disclosure for one link).
  qsa('details.crm-nav-subgroup', navEl).forEach(function (sub) {
    var links = qsa(':scope > .crm-nav-subgroup-links > a[href]', sub);
    if (links.length !== 1) return;
    var summary = qs(':scope > summary', sub);
    var styles = summary ? getComputedStyle(summary) : null;
    var link = links[0];
    link.classList.add('fx-side-single');
    ['--fx-ic', '--fx-ic-bg'].forEach(function (name) {
      var value = styles ? styles.getPropertyValue(name).trim() : '';
      if (value) link.style.setProperty(name, value);
    });
    if (!link.title && summary) link.title = labelOf(summary);
    sub.parentNode.replaceChild(link, sub);
  });

  // 2. Disclosure: the area you are in is open, every other area closed.
  var hereLink = HERE && HERE.entry.link;
  qsa('details.crm-nav-subgroup', navEl).forEach(function (sub) {
    sub.open = !!(hereLink && sub.contains(hereLink));
  });

  // 3. Sections remember being collapsed; the one you are in always opens.
  var collapsed = store.get('collapsed-sections', {});
  qsa('details.crm-nav-group', navEl).forEach(function (group) {
    var name = labelOf(qs(':scope > summary', group));
    var containsHere = !!(hereLink && group.contains(hereLink));
    if (containsHere) group.open = true;
    else if (Object.prototype.hasOwnProperty.call(collapsed, name)) group.open = !collapsed[name];
    group.addEventListener('toggle', function () {
      if (sidebar.classList.contains('fx-filtering')) return;
      var state = store.get('collapsed-sections', {});
      state[name] = !group.open;
      store.set('collapsed-sections', state);
    });
  });

  // 4. Personal account pages move into the account menu (footer).
  var accountGroup = qsa('details.crm-nav-group', navEl).filter(function (group) {
    var links = qsa('a[href]', group);
    return links.length && links.every(function (a) { return /[?&]account_view=/.test(a.getAttribute('href') || ''); });
  })[0];
  var accountLinks = accountGroup ? qsa('a[href]', accountGroup) : [];
  if (accountGroup) accountGroup.parentNode.removeChild(accountGroup);

  buildSideSearch();
  buildSidebarFooter(accountLinks);

  // 5. Bring the current page into view inside the list.
  if (hereLink && navEl.contains(hereLink)) {
    var linkTop = hereLink.offsetTop, viewTop = navEl.scrollTop, height = navEl.clientHeight;
    if (linkTop < viewTop + 40 || linkTop > viewTop + height - 60) navEl.scrollTop = Math.max(0, linkTop - height / 3);
  }

  // 6. Favourites header reads as a plain section title.
  function tidyFavorites() {
    var heading = qs('.crm-favorites-group > strong', navEl);
    if (heading && heading.textContent !== 'Favorites') heading.textContent = 'Favorites';
  }
  tidyFavorites();
  new MutationObserver(tidyFavorites).observe(navEl, { childList: true });

  setupOverlay();
}

function buildSideSearch() {
  var label = qs(':scope > .eyebrow', sidebar);
  var input = el('input', {
    type: 'search', placeholder: 'Find a page', 'aria-label': 'Find a page in the menu',
    autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'go'
  });
  var box = el('div', { class: 'fx-side-search', role: 'search' }, [icon('search'), input]);
  if (label) label.parentNode.insertBefore(box, label);
  else sidebar.insertBefore(box, navEl);
  sideSearchInput = input;

  var empty = el('p', { class: 'fx-side-empty', hidden: true });
  navEl.appendChild(empty);
  var savedOpen = null;

  function visibleLinks() {
    return qsa('a[href]', navEl).filter(function (a) {
      return !a.closest('[data-fx-hidden]') && !a.closest('.crm-favorites-group');
    });
  }

  function filter() {
    var q = norm(input.value);
    var groups = qsa('details.crm-nav-group', navEl);
    var subs = qsa('details.crm-nav-subgroup', navEl);
    if (!q) {
      sidebar.classList.remove('fx-filtering');
      qsa('[data-fx-hidden]', navEl).forEach(function (n) { n.removeAttribute('data-fx-hidden'); });
      if (savedOpen) savedOpen.forEach(function (s) { s.node.open = s.open; });
      savedOpen = null;
      empty.hidden = true;
      return;
    }
    if (!savedOpen) savedOpen = groups.concat(subs).map(function (node) { return { node: node, open: node.open }; });
    sidebar.classList.add('fx-filtering');
    var words = q.split(' ');
    var count = 0;
    qsa('a[href]', navEl).forEach(function (a) {
      if (a.closest('.crm-favorites-group')) return;
      var entry = NAV.filter(function (n) { return n.link === a; })[0];
      var hay = norm(labelOf(a) + ' ' + (entry ? entry.area + ' ' + entry.keywords : ''));
      var hit = words.every(function (w) { return (' ' + hay).indexOf(' ' + w) !== -1; });
      if (hit) { a.removeAttribute('data-fx-hidden'); count += 1; } else a.setAttribute('data-fx-hidden', '');
    });
    subs.forEach(function (sub) {
      var any = qsa('a[href]', sub).some(function (a) { return !a.hasAttribute('data-fx-hidden'); });
      if (any) { sub.removeAttribute('data-fx-hidden'); sub.open = true; } else sub.setAttribute('data-fx-hidden', '');
    });
    groups.forEach(function (group) {
      var any = qsa('a[href]', group).some(function (a) { return !a.closest('[data-fx-hidden]'); });
      if (any) { group.removeAttribute('data-fx-hidden'); group.open = true; } else group.setAttribute('data-fx-hidden', '');
    });
    empty.hidden = count > 0;
    empty.textContent = count ? '' : 'No pages match “' + input.value.trim() + '”. Press Return to search records.';
  }

  input.addEventListener('input', filter);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (input.value) { input.value = ''; filter(); e.stopPropagation(); e.preventDefault(); }
      else input.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var first = visibleLinks()[0];
      if (input.value.trim() && first && sidebar.classList.contains('fx-filtering')) location.href = first.href;
      else if (input.value.trim()) openPalette(input.value.trim());
    } else if (e.key === 'ArrowDown') {
      var target = visibleLinks()[0];
      if (target) { e.preventDefault(); target.focus(); }
    }
  });
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
      var hereLink = HERE && HERE.entry.link;
      if (hereLink && navEl.contains(hereLink)) hereLink.scrollIntoView({ block: 'center' });
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
