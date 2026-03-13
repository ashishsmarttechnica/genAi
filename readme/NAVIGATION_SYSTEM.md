# Navigation System Documentation

## Overview

This document explains how the navigation system works in the application.
The system uses a **dynamic getter-function pattern** — navigation data is never
hard-coded as static objects. Every nav node is produced at call-time by a getter
function, keeping paths fresh and the entire system DRY.

---

## Table of Contents

1. [Navigation Types](#1-navigation-types)
2. [Node Structure](#2-node-structure)
3. [URL Utilities](#3-url-utilities)
4. [Navigation Files](#4-navigation-files)
5. [How the Sidebar Consumes Navigation](#5-how-the-sidebar-consumes-navigation)
6. [UI Component Hierarchy](#6-ui-component-hierarchy)
7. [Adding a New Section](#7-adding-a-new-section)
8. [Adding a Child Item to an Existing Section](#8-adding-a-child-item-to-an-existing-section)
9. [Adding a Collapsible (Nested) Item](#9-adding-a-collapsible-nested-item)
10. [Badge / Info on a Menu Item](#10-badge--info-on-a-menu-item)
11. [i18n (Translation Keys)](#11-i18n-translation-keys)
12. [Best Practices](#12-best-practices)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Navigation Types

Defined in `src/constants/app.constant.js`:

| Constant              | Value        | Usage                                              |
|-----------------------|--------------|----------------------------------------------------|
| `NAV_TYPE_ROOT`       | `'root'`     | Top-level section header with children (e.g., "Dashboards") |
| `NAV_TYPE_GROUP`      | `'group'`    | Visual grouping label (label only, no link)        |
| `NAV_TYPE_COLLAPSE`   | `'collapse'` | Accordion item — expands to show nested children   |
| `NAV_TYPE_ITEM`       | `'item'`     | Plain clickable link                               |
| `NAV_TYPE_DIVIDER`    | `'divider'`  | Visual horizontal separator                        |

The `Group` component uses `item.type` to decide which sub-component to render:

```js
switch (item.type) {
  case NAV_TYPE_COLLAPSE: return <CollapsibleItem data={item} />;
  case NAV_TYPE_ITEM:     return <MenuItem data={item} />;
  default:                return null;
}
```

---

## 2. Node Structure

Every navigation node is a plain JavaScript object with the following shape:
Defined in `src/app/navigation/dashboards.js`:

```js
{
  id:       'section.child',          // Unique dot-separated ID (required)
  type:     NAV_TYPE_ITEM,            // One of the NAV_TYPE_* constants (required)
  path:     getSectionPath('child'),  // Always use a getter — never a raw string
  title:    'Child Page',             // Display title (used when i18n is off)
  transKey: 'nav.section.child',      // i18n translation key
  Icon:     SomeIcon,                 // Heroicon / react-icons component (optional)
  childs:   [ /* child nodes */ ],    // Nested children (optional)
}
```

### Field Reference

| Field      | Required | Description                                          |
|------------|----------|------------------------------------------------------|
| `id`       | ✅        | Unique identifier; used by `useRouteLoaderData` for badges |
| `type`     | ✅        | Determines rendering component                       |
| `path`     | ✅        | URL path — always use a path-getter utility          |
| `title`    | ✅        | Fallback display name                                |
| `transKey` | ✅        | i18n key for the translated label                    |
| `Icon`     | ❌        | React SVG component; shown in the sidebar item       |
| `childs`   | ❌        | Array of child nodes for `ROOT` / `COLLAPSE` types   |

---

## 3. URL Utilities

File: `src/utils/urlUtils.js`

Never hard-code paths inside navigation files. Always use URL utilities.

```js
// Private — joins segments safely:
function buildPath(basePath, subPath = '') {
  if (!subPath) return basePath;
  const cleanSegment = subPath.startsWith('/') ? subPath.slice(1) : subPath;
  return `${basePath}/${cleanSegment}`;
}

// Public exports:
getDashboardPath()            // → '/dashboards'
getDashboardPath('sales')     // → '/dashboards/sales'
getSettingsPath()             // → '/settings'
getSettingsPath('appearance') // → '/settings/appearance'
```

### Adding a New Path Utility

When you add a new section (e.g., `/reports`), add its getter to `urlUtils.js`:

```js
/**
 * Returns the reports base path or a child path.
 * @param {string} [subPath='']
 * @returns {string}
 */
export function getReportsPath(subPath = '') {
  return buildPath('/reports', subPath);
}
```

---

## 4. Navigation Files

All navigation files live in `src/app/navigation/`.

```
src/app/navigation/
├── index.js            ← Central entry point for the main sidebar
├── baseNavigation.js   ← Flat list for compact / icon-only sidebars
├── dashboards.js       ← Dashboards section tree
└── settings.js         ← Settings section tree
```

### `index.js` — Main Sidebar Entry Point

```js
// What the main sidebar calls:
export const getNavigation = () => [getDashboardsNavigation()];
//                                    ↑ Add new sections here

// Backward-compat static export (prefer getNavigation() over this):
export const navigation = [getDashboardsNavigation, getSettingsNavigation];

// Re-export for compact sidebars:
export { baseNavigation } from './baseNavigation';
```

> **Note**: Settings is intentionally excluded from `getNavigation()` because
> it lives in its own `AppLayout` sidebar, not the main `DynamicLayout` sidebar.

### `baseNavigation.js` — Compact Sidebar Navigation

Used by icon-only / compact sidebars. Flat array — no nested children.

```js
export const getBaseNavigation = () => [
  {
    id: 'dashboards',
    type: NAV_TYPE_ITEM,
    path: getDashboardPath(),
    title: 'Dashboards',
    transKey: 'nav.dashboards.dashboards',
    Icon: DashboardsIcon,
  },
];

// Static snapshot for backward compat:
export const baseNavigation = getBaseNavigation();
```

### `dashboards.js` — Section with Children

```js
export const getDashboardsNavigation = () => ({
  id: 'dashboards',
  type: NAV_TYPE_ROOT,
  path: getDashboardPath(),
  title: 'Dashboards',
  transKey: 'nav.dashboards.dashboards',
  Icon: DashboardsIcon,
  childs: [
    {
      id: 'dashboards.sales',
      type: NAV_TYPE_ITEM,
      path: getDashboardPath('sales'),
      title: 'Sales',
      transKey: 'nav.dashboards.sales',
      Icon: HomeIcon,
    },
    // more items...
  ],
});

// Static snapshot:
export const dashboards = getDashboardsNavigation();
```

---

## 5. How the Sidebar Consumes Navigation

File: `src/app/layouts/Sideblock/Sidebar/Menu/index.jsx`

```js
// 1. Get fresh nav at render time (NOT a static import):
const navigation = getNavigation();

// 2. Find which group is currently active (URL matching):
const activeGroup = navigation.find(item => isRouteActive(item.path, pathname));

// 3. Find active collapsible child (for Accordion open state):
const activeCollapsible = activeGroup?.childs?.find(item =>
  isRouteActive(item.path, pathname)
);

// 4. Accordion state
const [expanded, setExpanded] = useState(activeCollapsible?.path || null);
```

The sidebar wraps everything in a `SimpleBar` scrollable container and an
`Accordion` component that manages which collapsible item is open.

---

## 6. UI Component Hierarchy

```
Menu (index.jsx)
└── Accordion
    └── Group (Group/index.jsx)          ← One per top-level nav node
        ├── [Section Header Button]      ← Toggles collapse/expand of section
        └── Collapse
            ├── CollapsibleItem          ← For NAV_TYPE_COLLAPSE nodes
            └── MenuItem                 ← For NAV_TYPE_ITEM nodes
```

### `MenuItem.jsx`

Renders a single `NavLink`. Key behaviors:

- `isActive` from React Router drives the active highlight (left border strip + text color)
- `useRouteLoaderData("root")?.[id]?.info` — fetches dynamic badge data (e.g., notification count) from the route loader
- `lgAndDown && close()` — auto-closes the sidebar on tablet/mobile after click

```jsx
const info = useRouteLoaderData("root")?.[id]?.info;
// info shape: { val: 5, color: 'error' }
```

---

## 7. Adding a New Section

Example: Adding a **Reports** section.

### Step 1 — Add URL utility (`src/utils/urlUtils.js`)

```js
export function getReportsPath(subPath = '') {
  return buildPath('/reports', subPath);
}
```

### Step 2 — Create navigation file (`src/app/navigation/reports.js`)

```js
// Import Dependencies
import { ChartBarIcon } from '@heroicons/react/24/outline';

// Local Imports
import ReportsIcon from 'assets/dualicons/reports.svg?react';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';
import { getReportsPath } from 'utils/urlUtils';

// ----------------------------------------------------------------------

/**
 * Returns the reports navigation tree.
 * @returns {object} Navigation node
 */
export const getReportsNavigation = () => ({
  id: 'reports',
  type: NAV_TYPE_ROOT,
  path: getReportsPath(),
  title: 'Reports',
  transKey: 'nav.reports.reports',
  Icon: ReportsIcon,
  childs: [
    {
      id: 'reports.sales',
      type: NAV_TYPE_ITEM,
      path: getReportsPath('sales'),
      title: 'Sales',
      transKey: 'nav.reports.sales',
      Icon: ChartBarIcon,
    },
    {
      id: 'reports.analytics',
      type: NAV_TYPE_ITEM,
      path: getReportsPath('analytics'),
      title: 'Analytics',
      transKey: 'nav.reports.analytics',
      Icon: ChartBarIcon,
    },
  ],
});

// Static snapshot for backward compat:
export const reports = getReportsNavigation();
```

### Step 3 — Register in `index.js`

```js
import { getReportsNavigation } from './reports';

export const getNavigation = () => [
  getDashboardsNavigation(),
  getReportsNavigation(), // ← Add here
];
```

### Step 4 — Add routes (in your router config)

```jsx
{
  path: 'reports',
  children: [
    { index: true, element: <Navigate to="sales" replace /> },
    {
      path: 'sales',
      lazy: async () => ({
        Component: (await import('app/pages/reports/sales')).default,
      }),
    },
    {
      path: 'analytics',
      lazy: async () => ({
        Component: (await import('app/pages/reports/analytics')).default,
      }),
    },
  ],
}
```

---

## 8. Adding a Child Item to an Existing Section

To add a new page to an **existing** section (e.g., a new Dashboard):

### Step 1 — Add URL utility (if new sub-path needed)

`getDashboardPath()` already exists — just pass a new `subPath`.

### Step 2 — Add a child node to `childs[]` in `dashboards.js`

```js
{
  id: 'dashboards.crm',
  type: NAV_TYPE_ITEM,
  path: getDashboardPath('crm'),   // → '/dashboards/crm'
  title: 'CRM',
  transKey: 'nav.dashboards.crm',
  Icon: UserGroupIcon,
},
```

### Step 3 — Add the route in your router config

```jsx
{
  path: 'crm',
  lazy: async () => ({
    Component: (await import('app/pages/dashboards/crm')).default,
  }),
}
```

---

## 9. Adding a Collapsible (Nested) Item

Use `NAV_TYPE_COLLAPSE` when a sidebar item needs a sub-menu that expands on click.

```js
// Inside a section's childs[]:
{
  id: 'reports.financial',
  type: NAV_TYPE_COLLAPSE,          // ← Important: COLLAPSE, not ITEM
  path: getReportsPath('financial'),
  title: 'Financial',
  transKey: 'nav.reports.financial',
  Icon: BanknotesIcon,
  childs: [
    {
      id: 'reports.financial.income',
      type: NAV_TYPE_ITEM,
      path: getReportsPath('financial/income'),
      title: 'Income',
      transKey: 'nav.reports.financial.income',
    },
    {
      id: 'reports.financial.expenses',
      type: NAV_TYPE_ITEM,
      path: getReportsPath('financial/expenses'),
      title: 'Expenses',
      transKey: 'nav.reports.financial.expenses',
    },
  ],
},
```

The `Group` component will automatically render this as a `CollapsibleItem`
because of the `switch(item.type)` logic.

---

## 10. Badge / Info on a Menu Item

`MenuItem` reads dynamic badge data from the **route loader** — not from the
navigation object itself. This keeps nav data static and badge data dynamic.

### How it works

```js
// In MenuItem.jsx:
const info = useRouteLoaderData("root")?.[id]?.info;
// ↑ Reads from root loader data using the nav node's `id` as key
```

### Shape of `info`

```js
{
  val: 12,        // Badge value (number or string). Falsy = badge hidden.
  color: 'error', // Badge color: 'primary' | 'error' | 'warning' | 'success' | etc.
}
```

### Setting up badge data in the root loader

```js
// In your root route loader:
export async function loader() {
  return {
    'dashboards.sales': {
      info: { val: 3, color: 'error' },
    },
    // Add more menu item IDs here...
  };
}
```

> The key in the loader response **must match the nav node's `id`** exactly.

---

## 11. i18n (Translation Keys)

Every navigation node has a `transKey` field. To enable translations:

### Step 1 — Uncomment `useTranslation` in components

In `MenuItem.jsx` and `Group/index.jsx`:

```js
// Uncomment these lines:
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Then use:
const title = t(data.transKey) || data.title;
```

### Step 2 — Add keys to your locale file

`src/i18n/locales/en.json`:

```json
{
  "nav": {
    "dashboards": {
      "dashboards": "Dashboards",
      "sales": "Sales",
      "home": "Home",
      "analytics": "Analytics"
    },
    "reports": {
      "reports": "Reports",
      "sales": "Sales Reports",
      "analytics": "Analytics Reports"
    },
    "settings": {
      "settings": "Settings",
      "general": "General",
      "appearance": "Appearance"
    }
  }
}
```

---

## 12. Best Practices

| ✅ Do                                              | ❌ Don't                                         |
|----------------------------------------------------|--------------------------------------------------|
| Use getter functions (`getDashboardsNavigation()`) | Export static nav objects directly               |
| Use `urlUtils.js` path getters for all paths       | Hard-code path strings like `'/dashboards/sales'`|
| Use dot-notation IDs (`'reports.sales'`)           | Use vague IDs like `'page1'`                     |
| Keep `childs` in the same file as the parent node  | Scatter nav definitions across unrelated files   |
| Import icons from a single icon library per section| Mix icon libraries randomly                     |
| Add a `transKey` even if i18n is disabled now      | Skip `transKey` — hard to add later              |
| Use `?.` safe access (`data.childs?.map(...)`)     | Assume `childs` always exists                    |

---

## 13. Troubleshooting

### Sidebar item not showing

- Check that the nav node is included in `getNavigation()` in `index.js`
- Verify the `type` is set correctly (`NAV_TYPE_ROOT` / `NAV_TYPE_ITEM`)
- Ensure `childs` is not empty for `NAV_TYPE_ROOT` nodes — an empty children array will render a header with no items

### Active state not highlighting

- Check that `path` matches the exact route path registered in the router
- Use `getDashboardPath('sales')` not `'/dashboards/sales'` to avoid typos
- Inspect `isRouteActive` logic in `utils/isRouteActive.js`

### Accordion not auto-opening on page load

- Verify the `id` values match between the navigation node and the actual URL
- `activeCollapsible` detection relies on `isRouteActive(item.path, pathname)` — the path must be reachable

### Badge not appearing

- Confirm the nav node's `id` exactly matches the key returned by the root route loader
- Check that `info.val` is truthy (non-zero, non-empty)
- Verify the root loader is returning the correct data shape: `{ [id]: { info: { val, color } } }`

### `scrollIntoView` not working for active item

- `Menu/index.jsx` uses `const ref = useRef()` — ensure it is not destructured as `const { ref } = useRef()` (which is incorrect)
- The `ref` must be passed to `SimpleBar`'s `scrollableNodeProps`
