# Page Creation Guide

## Overview

This document explains how to create a new page in the application end-to-end.
Every new page involves **4 steps** done in order:

1. Create the **Page Component** (`src/app/pages/`)
2. Register the **Route** (`src/app/router/protected.jsx`)
3. Add the **URL Utility** (`src/utils/urlUtils.js`)
4. Add the **Navigation Entry** (`src/app/navigation/`)

---

## Table of Contents

1. [Layouts — Which One to Use?](#1-layouts--which-one-to-use)
2. [Step 1 — Create the Page Component](#2-step-1--create-the-page-component)
3. [Step 2 — Register the Route](#3-step-2--register-the-route)
4. [Step 3 — Add URL Utility](#4-step-3--add-url-utility)
5. [Step 4 — Add Navigation Entry](#5-step-4--add-navigation-entry)
6. [Full Example — Adding a "Reports" Section](#6-full-example--adding-a-reports-section)
7. [Page with Child Routes (Tabs)](#7-page-with-child-routes-tabs)
8. [Settings-Style Page (AppLayout)](#8-settings-style-page-applayout)
9. [File & Folder Naming Rules](#9-file--folder-naming-rules)
10. [Common Mistakes](#10-common-mistakes)

---

## 1. Layouts — Which One to Use?

There are **two layouts** for protected pages. Pick the correct one before writing any code.

| Layout          | Used For                          | Sidebar            | File                          |
|-----------------|-----------------------------------|--------------------|-------------------------------|
| `DynamicLayout` | All regular pages (dashboards, reports, CRM, etc.) | Main sidebar with nav | `app/layouts/DynamicLayout.jsx` |
| `AppLayout`     | Settings-style pages only         | Settings sidebar   | `app/layouts/AppLayout.jsx`   |

**Rule of thumb:**
- New section from sidebar → **`DynamicLayout`** ✅
- New settings sub-page → **`AppLayout`** ✅

In `protected.jsx`, the structure looks like this:

```jsx
const protectedRoutes = {
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,   // ← Regular pages go here
      children: [ /* your routes */ ]
    },
    {
      Component: AppLayout,       // ← Settings pages go here
      children: [ /* settings routes */ ]
    },
  ],
};
```

---

## 2. Step 1 — Create the Page Component

### Folder Structure

Pages live in `src/app/pages/`. Each page is a **folder** with an `index.jsx` file.

```
src/app/pages/
├── dashboards/
│   ├── home/
│   │   └── index.jsx     ← Page component
│   └── sales/
│       └── index.jsx
└── your-section/
    └── your-page/
        └── index.jsx     ← Your new page goes here
```

### Minimal Page Template

```jsx
// src/app/pages/your-section/your-page/index.jsx

// Local Imports
import { Page } from "components/shared/Page";

// ----------------------------------------------------------------------

export default function YourPage() {
  return (
    <Page title="Your Page Title">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Your Page
          </h2>
          {/* Page content here */}
        </div>
      </div>
    </Page>
  );
}
```

### Key Rules for the Page Component

| Rule | Detail |
|---|---|
| Always use `<Page title="...">` | Sets the browser tab title via `document.title` |
| Use `transition-content` class | Ensures proper layout transition animation |
| Use `px-(--margin-x)` | Keeps horizontal spacing consistent with all other pages |
| `export default` | Router's `lazy()` requires a default export |
| One component per `index.jsx` | Never export multiple page components from one file |

---

## 3. Step 2 — Register the Route

File: `src/app/router/protected.jsx`

All routes use **lazy loading** (`lazy: async () => ...`). This code-splits every page automatically — only loaded when the user visits that URL.

### Adding Under DynamicLayout (Standard)

```jsx
// src/app/router/protected.jsx
{
  Component: DynamicLayout,
  children: [
    // Existing routes...
    {
      path: "your-section",           // → URL: /your-section
      children: [
        {
          index: true,
          element: <Navigate to="/your-section/your-page" />,  // default redirect
        },
        {
          path: "your-page",          // → URL: /your-section/your-page
          lazy: async () => ({
            Component: (await import("app/pages/your-section/your-page")).default,
          }),
        },
      ],
    },
  ],
},
```

### Single Page (No Children)

If your section has only one page (no sub-routes):

```jsx
{
  path: "your-section",
  lazy: async () => ({
    Component: (await import("app/pages/your-section")).default,
  }),
},
```

### Why `lazy`?

```js
// ❌ Static import — entire bundle loads on first visit
import YourPage from "app/pages/your-section/your-page";

// ✅ Lazy import — only loads when user visits /your-section/your-page
lazy: async () => ({
  Component: (await import("app/pages/your-section/your-page")).default,
})
```

---

## 4. Step 3 — Add URL Utility

File: `src/utils/urlUtils.js`

**Never write raw path strings in navigation files.** Always create a getter function.

```js
// src/utils/urlUtils.js

/**
 * Returns the your-section base path or a child path.
 * @param {string} [subPath=''] - e.g. 'your-page', 'another-page'
 * @returns {string}
 */
export function getYourSectionPath(subPath = '') {
  return buildPath('/your-section', subPath);
}
```

Usage examples:

```js
getYourSectionPath()             // → '/your-section'
getYourSectionPath('your-page')  // → '/your-section/your-page'
```

---

## 5. Step 4 — Add Navigation Entry

### 5a. Create a Navigation File

```js
// src/app/navigation/yourSection.js

// Import Dependencies
import { SomeIcon } from '@heroicons/react/24/outline';

// Local Imports
import YourSectionIcon from 'assets/dualicons/your-section.svg?react';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';
import { getYourSectionPath } from 'utils/urlUtils';

// ----------------------------------------------------------------------

/**
 * Returns the your-section navigation tree.
 * @returns {object} Navigation node
 */
export const getYourSectionNavigation = () => ({
  id: 'your-section',
  type: NAV_TYPE_ROOT,
  path: getYourSectionPath(),
  title: 'Your Section',
  transKey: 'nav.yourSection.yourSection',
  Icon: YourSectionIcon,
  childs: [
    {
      id: 'your-section.your-page',
      type: NAV_TYPE_ITEM,
      path: getYourSectionPath('your-page'),
      title: 'Your Page',
      transKey: 'nav.yourSection.yourPage',
      Icon: SomeIcon,
    },
  ],
});

// Static snapshot for backward compat
export const yourSection = getYourSectionNavigation();
```

### 5b. Register in `index.js`

```js
// src/app/navigation/index.js

import { getDashboardsNavigation } from './dashboards';
import { getYourSectionNavigation } from './yourSection';  // ← Add import

export const getNavigation = () => [
  getDashboardsNavigation(),
  getYourSectionNavigation(),   // ← Add here (order = sidebar order)
];
```

---

## 6. Full Example — Adding a "Reports" Section

This example adds a **Reports** section with two pages: Sales and Analytics.

### Step 1 — Create page components

```
src/app/pages/reports/
├── sales/
│   └── index.jsx
└── analytics/
    └── index.jsx
```

```jsx
// src/app/pages/reports/sales/index.jsx
import { Page } from "components/shared/Page";

export default function SalesReport() {
  return (
    <Page title="Sales Reports">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <h2 className="text-xl font-medium text-gray-800 dark:text-dark-50">
          Sales Reports
        </h2>
      </div>
    </Page>
  );
}
```

### Step 2 — Register routes in `protected.jsx`

```jsx
{
  path: "reports",
  children: [
    { index: true, element: <Navigate to="/reports/sales" /> },
    {
      path: "sales",
      lazy: async () => ({
        Component: (await import("app/pages/reports/sales")).default,
      }),
    },
    {
      path: "analytics",
      lazy: async () => ({
        Component: (await import("app/pages/reports/analytics")).default,
      }),
    },
  ],
},
```

### Step 3 — Add URL utility in `urlUtils.js`

```js
export function getReportsPath(subPath = '') {
  return buildPath('/reports', subPath);
}
```

### Step 4 — Create `src/app/navigation/reports.js`

```js
import { ChartBarIcon } from '@heroicons/react/24/outline';
import ReportsIcon from 'assets/dualicons/reports.svg?react';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';
import { getReportsPath } from 'utils/urlUtils';

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

export const reports = getReportsNavigation();
```

Register in `navigation/index.js`:

```js
import { getReportsNavigation } from './reports';

export const getNavigation = () => [
  getDashboardsNavigation(),
  getReportsNavigation(),
];
```

---

## 7. Page with Child Routes (Tabs)

When a page has **tabs** (e.g., `/profile/personal`, `/profile/security`), the parent page renders an `<Outlet />`.

### Router setup

```jsx
{
  path: "profile",
  lazy: async () => ({
    Component: (await import("app/pages/profile/Layout")).default,  // Has <Outlet />
  }),
  children: [
    { index: true, element: <Navigate to="/profile/personal" /> },
    {
      path: "personal",
      lazy: async () => ({
        Component: (await import("app/pages/profile/sections/Personal")).default,
      }),
    },
    {
      path: "security",
      lazy: async () => ({
        Component: (await import("app/pages/profile/sections/Security")).default,
      }),
    },
  ],
},
```

### Layout component (parent)

```jsx
// src/app/pages/profile/Layout.jsx
import { Outlet } from "react-router";
import { Page } from "components/shared/Page";

export default function ProfileLayout() {
  return (
    <Page title="Profile">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        {/* Tab navigation here */}
        <Outlet />   {/* ← Child route renders here */}
      </div>
    </Page>
  );
}
```

---

## 8. Settings-Style Page (AppLayout)

Settings pages use `AppLayout` instead of `DynamicLayout`. The only difference is **which children array** in `protected.jsx` you add your route to.

```jsx
// In protected.jsx → AppLayout children:
{
  Component: AppLayout,
  children: [
    {
      path: "settings",
      lazy: async () => ({
        Component: (await import("app/pages/settings/Layout")).default,
      }),
      children: [
        { index: true, element: <Navigate to="/settings/general" /> },
        {
          path: "general",
          lazy: async () => ({
            Component: (await import("app/pages/settings/sections/General")).default,
          }),
        },
        // Add new settings tab here the same way ↑
      ],
    },
  ],
},
```

Settings navigation is registered in `navigation/settings.js` (not in `getNavigation()` — settings has its own sidebar).

---

## 9. File & Folder Naming Rules

| What | Convention | Example |
|---|---|---|
| Page folder | `kebab-case` | `sales-report/` |
| Page file | Always `index.jsx` | `index.jsx` |
| Nav file | `camelCase.js` | `salesReport.js` |
| Route `path` | `kebab-case` | `path: "sales-report"` |
| Nav node `id` | `section.child` dot notation | `'reports.sales'` |
| URL utility | `get[Section]Path` | `getSalesReportPath()` |
| Component name | `PascalCase` | `SalesReport` |
| Nav getter | `get[Section]Navigation` | `getSalesReportNavigation()` |

---

## 10. Common Mistakes

| Mistake | Correct Approach |
|---|---|
| Hard-coding path strings `'/reports/sales'` | Use `getReportsPath('sales')` |
| Named export instead of default | `export default function Page()` |
| Forgetting `<Navigate>` on index route | Always add index redirect for sections with children |
| Adding route under wrong layout | Double-check `DynamicLayout` vs `AppLayout` |
| Nav entry added but `getNavigation()` not updated | Register in `navigation/index.js` |
| Not creating URL utility for new section | Always add to `urlUtils.js` first |
| `childs` array left empty on `NAV_TYPE_ROOT` | Root with no children renders an empty section header |
