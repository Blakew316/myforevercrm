(() => {
  const statusNodes = [...document.querySelectorAll('[data-field-location-status]')];
  const setStatus = text => statusNodes.forEach(n => n.textContent = text);
  document.querySelectorAll('[data-field-checkin],[data-field-checkout]').forEach(button => {
    const form = button.closest('form'); if (!form) return;
    form.addEventListener('submit', event => {
      if (!navigator.onLine) {
        event.preventDefault();
        setStatus('You are offline. Reconnect before checking in or out so the secure job event can be saved.');
        return;
      }
      if (form.dataset.locationReady === '1') return;
      if (!navigator.geolocation) {
        setStatus('This device does not provide browser GPS. The workspace may require location permission.');
        return;
      }
      event.preventDefault(); button.disabled = true; const old = button.textContent; button.textContent = 'Getting GPS…';
      setStatus('Requesting your location for this one check-in/out event…');
      navigator.geolocation.getCurrentPosition(position => {
        const prefix = button.hasAttribute('data-field-checkout') ? 'checkout' : 'checkin';
        const lat=form.querySelector('[name="'+prefix+'_lat"]'), lng=form.querySelector('[name="'+prefix+'_lng"]'), acc=form.querySelector('[name="'+prefix+'_accuracy"]');
        if(lat)lat.value = position.coords.latitude;
        if(lng)lng.value = position.coords.longitude;
        if(acc)acc.value = Math.round(position.coords.accuracy || 0);
        form.dataset.locationReady = '1';
        setStatus('Location captured for this event. Saving…');
        form.requestSubmit(button);
      }, err => {
        form.dataset.locationReady = '1'; button.disabled = false; button.textContent = old;
        const denied = err && err.code === 1;
        setStatus(denied ? 'Location permission was denied. Enable location for this site and try again if GPS is required.' : 'Location could not be captured. The server will enforce the workspace GPS requirement.');
        form.requestSubmit(button);
      }, {enableHighAccuracy:true, timeout:12000, maximumAge:10000});
    });
  });

  // Read-only, on-device filters: all job records come from the server's existing role-scoped query.
  document.querySelectorAll('[data-field-agenda-filters]').forEach(group => {
    const cards = [...document.querySelectorAll('[data-field-agenda-job]')];
    const count = document.querySelector('[data-field-agenda-count]');
    const select = filter => {
      let visible = 0;
      cards.forEach(card => { const show = filter === 'all' || card.dataset.fieldAgendaJob === filter; card.hidden = !show; if(show) visible++; });
      group.querySelectorAll('[data-field-agenda-filter]').forEach(button => {
        const active = button.dataset.fieldAgendaFilter === filter;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('primary', active);
      });
      if(count) count.textContent = visible ? visible + ' active job' + (visible === 1 ? '' : 's') + ' shown' : 'No active jobs in this section.';
    };
    group.addEventListener('click', event => { const button = event.target.closest('[data-field-agenda-filter]'); if(button && group.contains(button)) select(button.dataset.fieldAgendaFilter); });
    select('all');
  });

  const network = () => {
    document.querySelectorAll('[data-field-mobile] form button[type="submit"], .field-job-detail form button[type="submit"]').forEach(b => {
      if(!navigator.onLine){ b.dataset.offlineDisabled='1'; b.disabled=true; }
      else if(b.dataset.offlineDisabled==='1'){ b.disabled=false; delete b.dataset.offlineDisabled; }
    });
    if(!navigator.onLine) setStatus('Offline mode: previously loaded page is visible, but private job changes are not queued on this device. Reconnect to save actions.');
  };
  window.addEventListener('online',network); window.addEventListener('offline',network); network();
})();