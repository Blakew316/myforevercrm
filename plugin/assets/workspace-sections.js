/* 3.0.16 — Progressive page organization. Display only; existing forms, actions,
   field names, authorization, and server-rendered content remain unchanged. */
(function () {
  'use strict';
  var app = document.querySelector('.app[data-sidebar-app]');
  if (!app) return;
  var tab = new URLSearchParams(window.location.search).get('tab') || 'overview';
  var enabled = ['automations','projects-settings','operations','team','customer-operations','lead-capture','security','commission-plans','commissions'];
  if (enabled.indexOf(tab) < 0) return;
  var main = app.querySelector('main');
  if (!main) return;
  var panels = Array.prototype.filter.call(main.children, function (el) {
    return el.tagName === 'SECTION' && el.classList.contains('card') &&
      !el.classList.contains('premium-lock-card') && el.querySelector('h2,h3');
  });
  if (panels.length < 3) return;
  var nav = document.createElement('nav');
  nav.className = 'crm-section-nav card';
  nav.setAttribute('aria-label','Sections on this page');
  var heading = document.createElement('div');
  heading.className = 'crm-section-nav-heading';
  heading.innerHTML = '<strong>Find what you need</strong><small>Choose a section. Your existing settings and actions are unchanged.</small>';
  nav.appendChild(heading);
  var controls = document.createElement('div');
  controls.className = 'crm-section-nav-controls';
  nav.appendChild(controls);
  var buttons = [];
  panels.forEach(function (panel, i) {
    var h = panel.querySelector('h2,h3');
    var label = (h.textContent || '').replace(/\s+/g,' ').trim() || ('Section '+(i+1));
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'crm-section-nav-item';
    button.textContent = label;
    button.setAttribute('aria-controls','crm-organized-section-'+i);
    panel.id = panel.id || 'crm-organized-section-'+i;
    button.setAttribute('aria-controls',panel.id);
    controls.appendChild(button);
    buttons.push(button);
  });
  var all = document.createElement('button');
  all.type = 'button';
  all.className = 'crm-section-show-all';
  all.textContent = 'Show all sections';
  controls.appendChild(all);
  function show(which) {
    panels.forEach(function (panel, index) {
      panel.hidden = which !== -1 && index !== which;
    });
    buttons.forEach(function (button,index) {
      button.setAttribute('aria-pressed',index === which ? 'true' : 'false');
    });
    all.setAttribute('aria-pressed',which === -1 ? 'true' : 'false');
    all.textContent = which === -1 ? 'Show one section' : 'Show all sections';
    if (which >= 0 && panels[which].querySelector('form')) {
      /* Do not alter fields or submit a form when switching sections. */
    }
  }
  buttons.forEach(function (button,index) {
    button.addEventListener('click',function () { show(index); });
  });
  all.addEventListener('click',function () {
    var showingAll = all.getAttribute('aria-pressed') === 'true';
    show(showingAll ? 0 : -1);
  });
  panels[0].parentNode.insertBefore(nav,panels[0]);
  /* On a posted/saved result show the complete page, retaining any notices.
     Edit links can target a particular form; show all to avoid hiding it. */
  var params = new URLSearchParams(window.location.search);
  var editRequested = ['edit_user','edit_rule','edit_plan','edit_vendor','job_id','commission_lead'].some(function (key) {
    return params.has(key) && params.get(key) !== '0';
  });
  function panelIndexByHeading(test) {
    for (var i = 0; i < panels.length; i++) {
      var h = panels[i].querySelector('h2,h3');
      var label = h ? (h.textContent || '').replace(/\s+/g,' ').trim() : '';
      if (test(label)) return i;
    }
    return -1;
  }
  /* Person creation/editing must never be hidden behind Workspace settings.
     The previous organizer defaulted to the first card, which made Add person
     look broken even though the form was rendered later on the same page. */
  if (params.has('add_user')) {
    var addPersonIndex = panelIndexByHeading(function (label) { return label === 'Add person'; });
    show(addPersonIndex >= 0 ? addPersonIndex : -1);
  } else if (editRequested) {
    show(-1);
  } else if (tab === 'team') {
    var usersIndex = panelIndexByHeading(function (label) { return label === 'Users & permissions'; });
    show(usersIndex >= 0 ? usersIndex : 0);
  } else {
    show(0);
  }
})();
