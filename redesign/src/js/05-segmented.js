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
