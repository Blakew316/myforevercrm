(() => {
  const button = document.getElementById('fag-use-location');
  const status = document.getElementById('fag-location-status');
  if (!button || !status) return;
  button.addEventListener('click', () => {
    if (!navigator.geolocation) { status.textContent = 'Location is unavailable. Enter the address manually.'; return; }
    button.disabled = true; status.textContent = 'Requesting your location…';
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude, accuracy } = position.coords;
      document.querySelector('input[name="latitude"]').value = latitude;
      document.querySelector('input[name="longitude"]').value = longitude;
      const accuracyText = 'Reported accuracy: about ' + Math.round(accuracy) + ' meters. ';
      try {
        if (!window.google?.maps?.importLibrary) throw new Error('Google address lookup is not configured.');
        const { Geocoder } = await google.maps.importLibrary('geocoding');
        const response = await new Geocoder().geocode({ location: { lat: latitude, lng: longitude } });
        if (!response.results?.length) throw new Error('No address was returned.');
        const result = response.results[0];
        if (window.fagFillAddressFields) window.fagFillAddressFields(result.address_components || [], result.formatted_address || '');
        status.textContent = accuracyText + 'Street, city, state and ZIP filled. Check the house number before saving.';
      } catch (_) { status.textContent = accuracyText + 'Location captured. Enter and verify the house address manually.'; }
      finally { button.disabled = false; }
    }, () => { status.textContent = 'Location could not be obtained. Allow location access or enter the address manually.'; button.disabled = false; }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
})();
