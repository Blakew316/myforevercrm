# My Forever CRM — Design 4.0

An Apple-style redesign of the My Forever CRM interface: San Francisco
typography, calmer spacing, one consistent set of controls, and a rebuilt way
of getting around (sidebar, toolbar, search, keyboard). It is a layer on top
of the existing plugin. Every screen, form, field name, permission check and
server action stays exactly as it is.

## What changes

**Look**
- Type: San Francisco on Apple devices (system font); everywhere else a bundled
  Inter variable font, the closest open equivalent. One type scale: 30 px large
  titles, 21 / 17 px section titles, 15 px body.
- Light gray canvas with white cards. Anything nested in a card becomes a quiet
  gray tile rather than another bordered box.
- Calm, neutral palette: white cards on light gray, capsule buttons (white
  for secondary, solid black for the one primary action). Blue only marks
  links and keyboard focus. Fields are 38 px (44 px on phones).
- Tables, status chips, notices, metrics, sheets and toasts all share the same
  tokens. Dark appearance follows the existing per-user Appearance preference.

**Navigation**
- **Sidebar, rebuilt around daily work.** The pages people open all day come
  first, one click each: Dashboard, Attention, Leads, Customers, Tasks,
  Calls, Inbox, Messages and Calendar. Everything else sits in a few
  collapsible sections. Only the section you're in opens.
- **Settings is its own panel.** The 50-plus workspace administration pages
  slide in behind **Settings ›**, so they no longer bury the daily pages. On
  an admin page the sidebar opens on that panel, with **‹ Main menu** to go
  back.
- **Pinned pages:** star any page in the sidebar to keep it at the top.
- **Search or jump to** (⌘K / Ctrl+K, `/`, or the Search field in the
  sidebar): one field for every page you can open, recent pages, pinned
  pages and quick actions. It also searches records with the CRM's own search.
- **Toolbar:** a pinned bar with hide/show sidebar, a Back button labelled
  with its destination (‹ Leads), the breadcrumb, search, inbox, alerts and
  **New**.
- **Tabs and view switchers** (Table / Pipeline, Call Center tabs, section
  pickers on long admin pages) are single-row segmented controls that scroll
  sideways instead of wrapping.
- **Account menu** in the sidebar footer holds your profile and settings
  pages, help, keyboard shortcuts and Log out.
- **Phone:** a tab bar with drawn icons. The menu slides in as a sheet and
  closes from the backdrop or Esc.
- **Keyboard:** ⌘K / Ctrl+K search, ⌘\ / Ctrl+\ sidebar, `G` then
  `H L C T K I N` to jump to the main pages, `?` for the list, Esc closes.

## Install

Build once (Node 18+): `node redesign/build.mjs`. The output lands in `dist/`,
which is committed so you can install without building.

### Recommended: must-use plugin (survives CRM plugin updates)

Copy into `wp-content/mu-plugins/`:

```
dist/mu-plugins/forever-crm-design.php
dist/mu-plugins/forever-crm-design/      (design-400.css, design-400.js, fonts/)
```

That's all. It adds one stylesheet and one script to pages that contain the
CRM app shell and leaves every other page alone. To remove it, delete those
two items. Nothing is written to the database.

### Alternative: drop-in files (no PHP)

Copy `dist/drop-in/crm.css`, `dist/drop-in/sidebar.js` and `dist/drop-in/fonts/`
over the files of the same name in
`wp-content/plugins/forever-agency-crm-3.2.08/assets/`. These are the original
files with Design 4.0 appended. A plugin update overwrites them, and browsers
keep the cached `?v=3.5.4` copies until the plugin version changes. Use a hard
refresh, or bump the version, after copying.

## Preview locally

Your capture zip holds real workspace data, so keep it out of this repository.
Unzip it anywhere, then:

```
node redesign/build.mjs
node tools/preview-server.mjs /path/to/unzipped-capture
# http://localhost:8040/forever-crm/?company=4&tab=leads
# add &design=0 to the URL to compare with the current design
```

## Layout of the repository

```
plugin/assets/         original 3.5.4 front-end files (baseline, unmodified) + bundled font
redesign/src/css/      the design system, one partial per concern (tokens → screens/)
redesign/src/js/       navigation script modules (model, sidebar, toolbar, search, shortcuts)
redesign/src/icons.mjs one icon set for both CSS and JS
redesign/build.mjs     builds dist/
integration/           the must-use plugin loader
tools/                 local preview server
dist/                  built, ready to install
```

## Worth fixing in the plugin itself

These come from server-rendered text, which a stylesheet cannot change well:

- Two menu pages share the name **Call Center Management** (one under
  Management & Oversight, one under Workspace Management), and two share
  **Notifications**. Search shows each one's location to tell them apart, but
  distinct names would be clearer.
- Several page labels include internal version numbers, for example
  "UNIFIED EXPERIENCE 3.5", "ANALYTICS 3.0" and "AUTOMATION 4.2". People don't
  need these.
- Page labels are typed in capitals in the markup. Sentence case in the PHP
  would read more naturally than restyling the capitals.
