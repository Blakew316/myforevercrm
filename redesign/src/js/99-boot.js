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
