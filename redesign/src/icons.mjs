/**
 * Design 4.0 icon set — one source for both the CSS (mask-image data URIs)
 * and the script (inline SVG). Drawn on a 24px grid with a 1.75px rounded
 * stroke so they sit comfortably beside San Francisco / Inter text.
 * Each value is the inner markup of an <svg viewBox="0 0 24 24">.
 */
export const ICONS = {
  circle: '<circle cx="12" cy="12" r="3.2" fill="#000" stroke="none"/>',
  house: '<path d="M4 10.4 12 4l8 6.4V19a1 1 0 0 1-1 1h-4.6v-5.6H9.6V20H5a1 1 0 0 1-1-1z"/>',
  people: '<circle cx="9" cy="8.5" r="3.25"/><path d="M3.25 19c.65-3.05 2.85-4.8 5.75-4.8s5.1 1.75 5.75 4.8"/><path d="M15.4 5.55a3.15 3.15 0 0 1 0 5.9"/><path d="M17 14.35c2 .55 3.25 2.05 3.75 4.65"/>',
  team: '<circle cx="12" cy="8.2" r="3"/><path d="M6.6 19.4c.55-3 2.75-4.7 5.4-4.7s4.85 1.7 5.4 4.7"/><circle cx="5.4" cy="10.2" r="2.1"/><circle cx="18.6" cy="10.2" r="2.1"/><path d="M2.4 17.4c.3-1.65 1.35-2.7 2.95-3M21.6 17.4c-.3-1.65-1.35-2.7-2.95-3"/>',
  person: '<circle cx="12" cy="12" r="8.75"/><circle cx="12" cy="10" r="3"/><path d="M6.3 18.4c1.15-2.05 3.15-3.15 5.7-3.15s4.55 1.1 5.7 3.15"/>',
  phone: '<path d="M6.7 3.75h2.55l1.45 4.05-2.05 1.5a11.2 11.2 0 0 0 6.05 6.05l1.5-2.05 4.05 1.45v2.55a2.05 2.05 0 0 1-2.15 2.05C10.6 18.95 5.05 13.4 4.6 5.9a2.05 2.05 0 0 1 2.1-2.15z"/>',
  'phone-device': '<rect x="7" y="2.75" width="10" height="18.5" rx="2.5"/><path d="M10.5 5.75h3M11 18h2"/>',
  headset: '<path d="M4.5 14.5V12a7.5 7.5 0 0 1 15 0v2.5"/><rect x="3.5" y="13.25" width="4" height="6" rx="1.6"/><rect x="16.5" y="13.25" width="4" height="6" rx="1.6"/><path d="M18.5 19.25c0 1.3-1.55 2-4 2H13"/>',
  calendar: '<rect x="3.75" y="5" width="16.5" height="15.25" rx="3"/><path d="M3.75 9.75h16.5M8 3v4M16 3v4"/>',
  doc: '<path d="M7 3.5h6.4l5.1 5.1v10.9a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-14.5A1.5 1.5 0 0 1 7 3.5z"/><path d="M13.4 3.5v5.1h5.1M9 13h6M9 16.5h6"/>',
  chart: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="6.5" width="3" height="11" rx="1"/><rect x="15.5" y="9" width="3" height="8.5" rx="1"/>',
  dollar: '<circle cx="12" cy="12" r="8.75"/><path d="M14.6 9.25c-.4-1-1.35-1.6-2.6-1.6-1.6 0-2.7.8-2.7 2s1 1.7 2.7 2.1 2.8.9 2.8 2.2-1.2 2.1-2.8 2.1c-1.3 0-2.3-.6-2.7-1.7M12 6v1.65M12 16.05v1.8"/>',
  gauge: '<path d="M4.1 17.2a8.75 8.75 0 1 1 15.8 0"/><path d="M12 13.4l3.7-3.9"/><circle cx="12" cy="13.6" r="1.3"/>',
  book: '<path d="M12 6.6C10.2 5.2 7.7 4.5 4.5 4.5v13c3.2 0 5.7.7 7.5 2.1 1.8-1.4 4.3-2.1 7.5-2.1v-13c-3.2 0-5.7.7-7.5 2.1z"/><path d="M12 6.6v13"/>',
  mappin: '<path d="M12 21s-6.5-5.65-6.5-11.1a6.5 6.5 0 0 1 13 0C18.5 15.35 12 21 12 21z"/><circle cx="12" cy="9.9" r="2.4"/>',
  map: '<path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>',
  briefcase: '<rect x="3.5" y="7" width="17" height="12.5" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
  heart: '<path d="M12 19.6s-7.75-4.45-7.75-10.1A4.2 4.2 0 0 1 12 7.15a4.2 4.2 0 0 1 7.75 2.35c0 5.65-7.75 10.1-7.75 10.1z"/>',
  building: '<path d="M4.5 20.5V5.5A1.5 1.5 0 0 1 6 4h7a1.5 1.5 0 0 1 1.5 1.5v15M14.5 10H18a1.5 1.5 0 0 1 1.5 1.5v9M3 20.5h18"/><path d="M8 8h3M8 11.5h3M8 15h3"/>',
  box: '<path d="M3.75 7.6 12 3.5l8.25 4.1v8.8L12 20.5l-8.25-4.1z"/><path d="M3.75 7.6 12 11.7l8.25-4.1M12 11.7v8.8"/>',
  tag: '<path d="M3.5 12.2V4.8a1.3 1.3 0 0 1 1.3-1.3h7.4l8.3 8.3a1.3 1.3 0 0 1 0 1.85l-7.2 7.2a1.3 1.3 0 0 1-1.85 0z"/><circle cx="8" cy="8" r="1.5"/>',
  banknote: '<rect x="2.75" y="6" width="18.5" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  bolt: '<path d="M13 2.75 5.25 13.25h6.25l-1 8L18.25 10.75H12z"/>',
  wrench: '<path d="M14.7 3.9a4.6 4.6 0 0 0-5.35 6l-5.6 5.6a1.95 1.95 0 0 0 2.75 2.75l5.6-5.6a4.6 4.6 0 0 0 6-5.35l-2.85 2.85-2.6-.4-.4-2.6z"/>',
  creditcard: '<rect x="2.75" y="5" width="18.5" height="14" rx="2.5"/><path d="M2.75 9.5h18.5M6.5 15h3.5"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.65 0l3-3A4 4 0 0 0 13 5.35l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.65 0l-3 3A4 4 0 0 0 11 18.65l1.2-1.2"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  archive: '<rect x="3.5" y="4.5" width="17" height="4.5" rx="1.5"/><path d="M5 9v9a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18V9M10 13h4"/>',
  search: '<circle cx="10.75" cy="10.75" r="6.25"/><path d="m15.5 15.5 4.75 4.75"/>',
  envelope: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.75 7.25 8.25 6 8.25-6"/>',
  bell: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  sidebar: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9.5 4.5v15M5.5 8.25h1.5M5.5 11.25h1.5"/>',
  'chevron-left': '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
  'chevron-right': '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  'chevron-down': '<path d="m5.5 9.25 6.5 6.5 6.5-6.5"/>',
  'chevron-updown': '<path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4"/>',
  star: '<path d="m12 3.8 2.5 5.1 5.6.8-4 3.95.95 5.6L12 16.6l-5.05 2.65.95-5.6-4-3.95 5.6-.8z"/>',
  'star-fill': '<path d="m12 3.8 2.5 5.1 5.6.8-4 3.95.95 5.6L12 16.6l-5.05 2.65.95-5.6-4-3.95 5.6-.8z" fill="#000"/>',
  clock: '<circle cx="12" cy="12" r="8.75"/><path d="M12 7.5V12l3 2"/>',
  checklist: '<path d="m4 7 1.5 1.5L8.5 5.5M4 13l1.5 1.5 3-3M11.5 7h8.5M11.5 13h8.5M11.5 18.5h8.5"/>',
  logout: '<path d="M14 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h7"/><path d="M16 8.5 19.5 12 16 15.5M19.5 12H10"/>',
  help: '<circle cx="12" cy="12" r="8.75"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4.85.85c0 1.75-2.45 2.1-2.45 3.65"/><path d="M12 17.1v.01" stroke-width="2.4"/>',
  keyboard: '<rect x="2.75" y="6" width="18.5" height="12" rx="2.5"/><path d="M6.5 10h1M10 10h1M13.5 10h1M17 10h.5M7.5 14h9"/>',
  sparkles: '<path d="M10 3.5 11.6 8.4 16.5 10l-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6z"/><path d="m17.5 14.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  'return': '<path d="M19 5.5v6a2.5 2.5 0 0 1-2.5 2.5H6"/><path d="m9.5 10.5-3.5 3.5 3.5 3.5"/>',
  message: '<path d="M5 19V7a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 7v6.5a2.5 2.5 0 0 1-2.5 2.5H9z"/>',
  info: '<circle cx="12" cy="12" r="8.75"/><path d="M12 11v5.25"/><path d="M12 7.9v.01" stroke-width="2.4"/>',
  warning: '<path d="M10.3 4.6a2 2 0 0 1 3.4 0l7.05 12.2a2 2 0 0 1-1.7 3H4.95a2 2 0 0 1-1.7-3z"/><path d="M12 9.5v4"/><path d="M12 16.6v.01" stroke-width="2.4"/>',
  'check-circle': '<circle cx="12" cy="12" r="8.75"/><path d="m8.25 12.25 2.5 2.5 5-5.25"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  'arrow-up-right': '<path d="M7.5 16.5 16.5 7.5M9 7.5h7.5V15"/>'
};

/** Icons also emitted as colored background images (masks cannot be used
 *  for <select> backgrounds). name -> stroke color */
export const TINTED = {
  'chevron-updown': { gray: '#86868b' }
};

export function svgMarkup(inner, stroke = '#000') {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + stroke +
    '" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}
