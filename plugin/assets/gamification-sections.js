/* Gamification 3.0.15: one section at a time. Existing forms/actions remain server-side. */
(function () {
  'use strict';
  var root = document.getElementById('gam-setup-panels');
  if (!root) return;
  var nav = root.querySelector('.gamification-subnav');
  if (!nav) return;
  var sections = ['gam-overview','gam-leaderboards','gam-participants','gam-scoring','gam-custom-rules','gam-badges','gam-adjustments','gam-history'];
  var current = '';
  var panels = [];
  Array.prototype.forEach.call(root.children, function (node) {
    if (node === nav) return;
    if (node.id && sections.indexOf(node.id) !== -1) current = node.id;
    if (node.matches && node.matches('section.card')) {
      if (!current) current = 'gam-overview';
      node.setAttribute('data-gam-panel',current);
      panels.push(node);
    }
  });
  function activate(section) {
    if (sections.indexOf(section) < 0) section = 'gam-leaderboards';
    panels.forEach(function (panel) { panel.hidden = panel.getAttribute('data-gam-panel') !== section; });
    Array.prototype.forEach.call(nav.querySelectorAll('a[href^="#gam-"]'), function (link) {
      var active = link.getAttribute('href') === '#'+section;
      if (active) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }
  nav.addEventListener('click',function (event) {
    var link = event.target.closest('a[href^="#gam-"]');
    if (!link) return;
    event.preventDefault();
    var next = link.getAttribute('href').slice(1);
    if (sections.indexOf(next) < 0) return;
    if (history.replaceState) history.replaceState(null,'','#'+next);
    activate(next);
  });
  activate(location.hash && sections.indexOf(location.hash.slice(1)) !== -1 ? location.hash.slice(1) : 'gam-leaderboards');
})();
