window.fagAddressParts = components => {
  const list = Array.isArray(components) ? components : [];
  const part = (type, short = false) => {
    const item = list.find(component => (component.types || []).includes(type));
    return item ? (short ? (item.shortText || item.short_name || item.longText || item.long_name || '') : (item.longText || item.long_name || item.shortText || item.short_name || '')) : '';
  };
  const number = part('street_number');
  const route = part('route');
  const unit = part('subpremise');
  const street = [number, route].filter(Boolean).join(' ') + (unit ? ' #' + unit : '');
  return {
    street: street.trim(),
    city: part('locality') || part('postal_town') || part('sublocality') || part('administrative_area_level_2'),
    state: part('administrative_area_level_1', true),
    zip: [part('postal_code'), part('postal_code_suffix')].filter(Boolean).join('-')
  };
};
window.fagFillAddressFields = (components, formatted = '') => {
  const values = window.fagAddressParts(components);
  const fields = {
    street_address: values.street || formatted,
    city: values.city,
    state: values.state,
    zip_code: values.zip
  };
  Object.entries(fields).forEach(([name, value]) => { const input = document.querySelector(`input[name="${name}"]`); if (input) input.value = value || ''; });
};

window.fagMapsReady = async () => {
  try {
    const addressFields = [...document.querySelectorAll('input[name="street_address"],input[name="city"],input[name="state"],input[name="zip_code"]')];
    const holder = document.getElementById('fag-autocomplete');
    if (holder && addressFields.length) {
      const { PlaceAutocompleteElement } = await google.maps.importLibrary('places');
      const autocomplete = new PlaceAutocompleteElement();
      holder.append(autocomplete);
      const lat = document.querySelector('input[name="latitude"]');
      const lng = document.querySelector('input[name="longitude"]');
      addressFields.forEach(field => field.addEventListener('input', () => { lat.value = ''; lng.value = ''; }));
      autocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
        try {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['formattedAddress', 'location', 'addressComponents'] });
          window.fagFillAddressFields(place.addressComponents || [], place.formattedAddress || '');
          lat.value = place.location ? place.location.lat() : '';
          lng.value = place.location ? place.location.lng() : '';
          document.getElementById('fag-address-status').textContent = 'Street, city, state and ZIP filled. Verify each field, then save the lead.';
        } catch (_) { document.getElementById('fag-address-status').textContent = 'Address lookup failed. You can enter the address manually.'; }
      });
    }
    const el = document.getElementById('fag-territory-map');
    if (el) {
      const { Map } = await google.maps.importLibrary('maps');
      const pins = JSON.parse(el.dataset.pins || '[]');
      const options = { center: pins[0] || { lat: 42.0987, lng: -75.918 }, zoom: 17, mapTypeId: 'satellite', tilt: 0 };
      if (el.dataset.mapId) options.mapId = el.dataset.mapId;
      const map = new Map(el, options);
      const route = JSON.parse(el.dataset.route || '[]');
      const bounds = new google.maps.LatLngBounds();
      if (route.length) {
        const path = route.filter(p => Number.isFinite(+p.lat) && Number.isFinite(+p.lng)).map(p => ({lat:+p.lat,lng:+p.lng}));
        if (path.length) {
          new google.maps.Polyline({ map, path, geodesic:true, strokeOpacity:.85, strokeWeight:4 });
          path.forEach(point => bounds.extend(point));
        }
      }
      if (el.dataset.mapId && pins.length) {
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
        for (const p of pins) {
          const marker = new AdvancedMarkerElement({ map, position: {lat:p.lat,lng:p.lng}, title: p.name + ' · ' + p.status });
          marker.addListener('click', () => { window.location.assign(p.url); }); bounds.extend({lat:p.lat,lng:p.lng});
        }
      }
      if ((route.length + pins.length) > 1 && !bounds.isEmpty()) map.fitBounds(bounds);
      document.getElementById('fag-map-status').textContent = route.length ? (route.length + ' voluntary field route points · ' + pins.length + ' GPS visit pins.') : (el.dataset.mapId ? (pins.length + ' assigned houses with map pins. Select a pin to open the record.') : 'Satellite view is available. Configure a Google map ID to display house pins.');
    }
  } catch (_) {
    const message = document.getElementById('fag-map-status') || document.getElementById('fag-address-status');
    if (message) message.textContent = 'Google Maps could not load. Check API configuration; manual addresses and driving links still work.';
  }
};
