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
- Capsule buttons: gray for secondary, solid ink for the one primary action.
  Fields are 38 px (44 px on phones) with a brand-tinted focus ring.
- The workspace brand color (Workspace branding) tints selection, icons, links
  and focus, so white-label workspaces keep their identity.
- Tables, status chips, notices, metrics, sheets and toasts all share the same
  tokens. Dark appearance follows the existing per-user Appearance preference.

**Navigation**
- **Sidebar**: a translucent source list with an icon per area. Only the area
  you are in opens, so the list is about a quarter of its old length. Sections
  you collapse stay collapsed. Areas with a single page become a single row.
- **Find a page**: a field at the top of the sidebar filters the menu as you
  type. It also matches everyday words, so typing "clock in" finds My Time & Pay.
- **Search or jump to** (⌘K / Ctrl+K, or `/`): one field for every page you can
  open, your recent pages, favorites and quick actions. It also searches your
  records with the CRM's own search. When what you type looks like a name
  rather than a page, record search comes first.
- **Toolbar**: a pinned bar with sidebar toggle, back, where-you-are and
  search, plus the inbox, alerts and **New** buttons. Back is labelled with its
  destination when known (‹ Leads). When the large page title scrolls away, the
  toolbar shows a compact copy.
- **View switchers** (Table / Pipeline, Open / Today / Overdue, Call Center and
  Setup Center tabs) are segmented controls, so navigation no longer looks like
  an action button.
- **Account menu** in the sidebar footer: your profile and settings pages, help,
  keyboard shortcuts and Log out. The "Need help?" strip and the session bar no
  longer take up the top of every page.
- **Phone**: an iOS-style tab bar with drawn icons. The menu slides in as a
  sheet and closes from the backdrop or Esc. Fields use 16 px text so iOS does
  not zoom in.
- **Keyboard**: ⌘K / Ctrl+K search, ⌘\ / Ctrl+\ sidebar, `G` then
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
