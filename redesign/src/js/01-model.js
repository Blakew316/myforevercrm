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
