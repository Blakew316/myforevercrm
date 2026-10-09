(() => {
  const form = document.getElementById('fagcrm-bulk');
  if (!form) return;
  const rows = [...document.querySelectorAll('[data-bulk-row]')].filter(el => el.form === form);
  const all = document.querySelector('[data-bulk-all]');
  const count = form.querySelector('[data-bulk-count]');
  const toolbar = form.querySelector('[data-bulk-toolbar]');
  const hint = form.querySelector('[data-bulk-hint]');
  const filtered = form.querySelector('[data-bulk-filtered]');
  const panels = [...form.querySelectorAll('[data-bulk-panel]')];
  const buttons = [...form.querySelectorAll('[data-bulk-review]')];
  let activePanel = null;
  function countSelected() { return rows.filter(el => el.checked).length; }
  function closePanels() {
    panels.forEach(panel => { panel.hidden = true; });
    activePanel = null;
  }
  function update() {
    const n = countSelected();
    const hasSelection = n > 0 || Boolean(filtered?.checked);
    if (count) count.textContent = filtered?.checked ? 'All filtered' : String(n);
    if (toolbar) toolbar.hidden = !hasSelection;
    if (hint) hint.hidden = hasSelection;
    if (all) {
      all.checked = rows.length > 0 && n === rows.length;
      all.indeterminate = n > 0 && n < rows.length;
    }
    buttons.forEach(btn => { btn.disabled = !hasSelection; });
    form.querySelectorAll('[data-selected-only]').forEach(btn => { btn.disabled = n === 0; });
    if (!hasSelection) closePanels();
  }
  function clearOtherPanels(panelName) {
    panels.filter(panel => panel.dataset.bulkPanel !== panelName).forEach(panel => {
      panel.querySelectorAll('select').forEach(el => {
        if ([...el.options].some(opt => opt.value === '__keep')) el.value = '__keep';
        else if (el.name === 'bulk_call_destination') el.value = 'new';
      });
      panel.querySelectorAll('input[type="checkbox"]').forEach(el => { el.checked = false; });
      panel.querySelectorAll('input[name="bulk_followup_date"],input[name="bulk_next_action"]').forEach(el => { el.value = ''; });
    });
  }
  form.querySelectorAll('[data-bulk-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.bulkOpen;
      const selectedPanel = panels.find(panel => panel.dataset.bulkPanel === name);
      if (!selectedPanel) return;
      clearOtherPanels(name);
      closePanels();
      activePanel = name;
      selectedPanel.hidden = false;
      selectedPanel.scrollIntoView({behavior:'smooth',block:'nearest'});
      selectedPanel.querySelector('select,input:not([type="hidden"]),button')?.focus({preventScroll:true});
    });
  });
  form.querySelectorAll('[data-bulk-close]').forEach(btn => btn.addEventListener('click', closePanels));
  form.querySelector('[data-bulk-clear]')?.addEventListener('click', () => {
    rows.forEach(el => { el.checked = false; });
    if (filtered) filtered.checked = false;
    update();
  });
  all?.addEventListener('change', () => { rows.forEach(el => { el.checked = all.checked; }); if (filtered) filtered.checked = false; update(); });
  filtered?.addEventListener('change', () => { if(filtered.checked) rows.forEach(el => {el.checked=false;}); update(); });
  rows.forEach(el => el.addEventListener('change', () => { if(filtered) filtered.checked=false; update(); }));
  form.addEventListener('submit', event => {
    const submitter = event.submitter;
    const kind = submitter?.dataset?.action;
    if (kind) {
      const action = form.querySelector('input[name="bulk_action"]');
      if (action) action.value = (kind === 'delete' || kind === 'trash') ? 'trash' : (kind === 'customer' ? 'customer' : 'edit');
      let intent = form.querySelector('input[name="bulk_intent"]');
      if (!intent) { intent = document.createElement('input'); intent.type = 'hidden'; intent.name = 'bulk_intent'; form.appendChild(intent); }
      intent.value = (kind === 'delete' || kind === 'trash') ? 'trash' : (kind === 'customer' ? 'customer' : 'edit');
      if (kind === 'call' && !form.querySelector('[name="bulk_call_confirm_purpose"]')?.checked) {
        event.preventDefault();
        window.alert('Confirm contact permission and Do Not Call checks before creating the call list.');
        return;
      }
      if (kind === 'stage' && form.querySelector('[name="bulk_stage"]')?.value === '__keep') {
        event.preventDefault(); window.alert('Choose the new stage first.'); return;
      }
    }
    if (submitter?.dataset?.bulkReview !== undefined && !filtered?.checked && countSelected() === 0) {
      event.preventDefault(); window.alert('Select at least one lead first.');
    }
  });
  update();
})();
