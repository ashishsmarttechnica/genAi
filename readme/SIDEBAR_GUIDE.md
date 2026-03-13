# Sidebar Guide

## Overview

This document explains how the Sidebar (Sideblock layout) works in the application.
The sidebar is a **context-driven, responsive panel** — it auto-opens on desktop and
auto-closes on mobile/tablet when a menu item is clicked.

---

## Table of Contents

1. [File Structure](#1-file-structure)
2. [Component Hierarchy](#2-component-hierarchy)
3. [SidebarContext — Open / Close State](#3-sidebarcontext--open--close-state)
4. [Sideblock — Root Layout](#4-sideblock--root-layout)
5. [Sidebar Panel](#5-sidebar-panel)
6. [Sidebar Header — Logo + Close Button](#6-sidebar-header--logo--close-button)
7. [Profile Popover](#7-profile-popover)
8. [Menu — Navigation List](#8-menu--navigation-list)
9. [Group — Section Renderer](#9-group--section-renderer)
10. [MenuItem — Clickable Nav Link](#10-menuitem--clickable-nav-link)
11. [CollapsibleItem — Accordion Sub-menu](#11-collapsibleitem--accordion-sub-menu)
12. [Responsive Behavior](#12-responsive-behavior)
13. [Customization Reference](#13-customization-reference)

---

## 1. File Structure

```
src/app/
├── contexts/
│   └── sidebar/
│       ├── context.js          ← React context definition
│       └── Provider.jsx        ← State logic (open/close/toggle + CSS class)
│
└── layouts/
    └── Sideblock/
        ├── index.jsx           ← Root layout (Header + Outlet + Sidebar)
        ├── Profile.jsx         ← User avatar popover (top of sidebar)
        └── Sidebar/
            ├── index.jsx       ← Sidebar panel + mobile overlay
            ├── Header.jsx      ← Logo + mobile close button
            └── Menu/
                ├── index.jsx   ← Navigation list (Accordion + active state)
                └── Group/
                    ├── index.jsx               ← Section header + children
                    ├── MenuItem.jsx            ← Single NavLink item
                    └── CollapsibleItem/
                        ├── index.jsx           ← Expandable accordion item
                        └── MenuItem.jsx        ← Child link inside collapsible
```

---

## 2. Component Hierarchy

```
Sideblock (index.jsx)
├── <Header />              ← Top navbar (separate from Sidebar)
├── <main>
│   └── <Outlet />          ← Page content renders here
└── <Sidebar />
    ├── <Header />          ← Sidebar logo + mobile close button
    └── <Menu />
        └── <Accordion>
            └── <Group />   ← One per top-level nav section
                ├── [Section Title Button]
                └── <Collapse>
                    ├── <MenuItem />          ← NAV_TYPE_ITEM
                    └── <CollapsibleItem />   ← NAV_TYPE_COLLAPSE
                        └── <MenuItem />      ← Nested child links
```

---

## 2.1 Layout Options 

```js

// change from  src/config/theme.config.js

themeLayout: "sideblock"
// Options: "sideblock" | "main-layout"

cardSkin: "bordered"
// Options: "bordered" | "shadow"
```

| Option | Visual |
|---|---|
| `"sideblock"` | Collapsible sidebar layout |
| `"main-layout"` | Fixed top + side navigation |
| `"bordered"` | Cards have a visible border |
| `"shadow"` | Cards have a drop shadow instead |

---


## 3. SidebarContext — Open / Close State

File: `src/app/contexts/sidebar/Provider.jsx`

The entire sidebar open/close state lives here. Any component can read or control it
via the `useSidebarContext()` hook.

### Context Values

```js
const { isExpanded, open, close, toggle } = useSidebarContext();
```

| Value | Type | Description |
|---|---|---|
| `isExpanded` | `boolean` | `true` = sidebar is open |
| `open()` | `function` | Opens the sidebar |
| `close()` | `function` | Closes the sidebar |
| `toggle()` | `function` | Toggles open/close |

### CSS Class on `<body>`

The provider automatically adds/removes a CSS class on `document.body`:

```js
// When sidebar opens:
document.body.classList.add("is-sidebar-open")

// When sidebar closes:
document.body.classList.remove("is-sidebar-open")
```

This class is used by CSS to shift the main content area left/right when sidebar opens.

### Auto-behavior

```js
// Sidebar starts open only on xl screens (≥1280px)
const [isExpanded] = useDisclosure(initialState.isExpanded && xlAndUp);

// Auto-close when screen resizes to lg or smaller
useDidUpdate(() => {
  lgAndDown && close();
}, [name]);  // name = current breakpoint name
```

---

## 4. Sideblock — Root Layout

File: `src/app/layouts/Sideblock/index.jsx`

The outermost layout wrapper for all pages using the sideblock layout:

```jsx
export default function Sideblock() {
  return (
    <>
      <Header />                                      {/* Top navbar */}
      <main className="main-content transition-content grid grid-cols-1">
        <Outlet />                                    {/* Page content */}
      </main>
      <Sidebar />                                     {/* Left sidebar */}
    </>
  );
}
```

- `transition-content` — CSS class that animates when sidebar opens/closes
- `<Outlet />` — React Router renders the matched page component here

---

## 5. Sidebar Panel

File: `src/app/layouts/Sideblock/Sidebar/index.jsx`

The sidebar panel itself — a fixed left panel with a mobile overlay.

### Visual Variants (controlled by `cardSkin`)

```jsx
// cardSkin = "shadow"
className="shadow-soft dark:shadow-dark-900/60"

// cardSkin = "bordered" (default)
className="border-gray-200 dark:border-dark-600/80 ltr:border-r rtl:border-l"
```

### Mobile Overlay

When on mobile/tablet (`lgAndDown`) and sidebar is open, a backdrop overlay is rendered
via `<Portal>` (renders outside the sidebar DOM tree to cover the full screen):

```jsx
{lgAndDown && isSidebarExpanded && (
  <Portal>
    <div
      onClick={closeSidebar}
      className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm"
    />
  </Portal>
)}
```

Clicking the overlay closes the sidebar.

---

## 6. Sidebar Header — Logo + Close Button

File: `src/app/layouts/Sideblock/Sidebar/Header.jsx`

```
┌─────────────────────────────────────┐
│  [Logo Icon]  [LogoType text]   [×] │  ← Close button (hidden on xl+)
└─────────────────────────────────────┘
```

### Modifying the Logo

```jsx
import Logo from 'assets/appLogo.svg?react';      // ← SVG icon mark
import LogoType from 'assets/logotype.svg?react';  // ← Full text logo

// Replace these SVG files to rebrand the sidebar header
```

### Close Button Visibility

```jsx
<div className="pt-5 xl:hidden">   {/* ← Hidden on xl and above */}
  <Button onClick={close} >
    <ChevronLeftIcon />
  </Button>
</div>
```

The close button is only visible on screens **smaller than `xl` (1280px)**.
On desktop, the sidebar is always visible — no need to close it.

---

## 7. Profile Popover

File: `src/app/layouts/Sideblock/Profile.jsx`

A user avatar at the top of the sidebar. Clicking it opens a popover with quick links.

### Quick Links Array

To **add, remove, or change profile menu links**, edit the `links` array at the top of the file:

```js
const links = [
  {
    id: "1",
    title: "Profile",
    description: "Your profile Setting",
    to: "/settings/general",
    Icon: TbUser,
    color: "warning",       // Avatar background color
  },
  {
    id: "2",
    title: "Billing",
    description: "Your billing information",
    to: "/settings/billing",
    Icon: TbCoins,
    color: "error",
  },
  {
    id: "3",
    title: "Settings",
    description: "Webapp settings",
    to: "/settings/appearance",
    Icon: Cog6ToothIcon,
    color: "success",
  },
];
```

### Changing User Info (Name / Avatar / Role)

Currently hardcoded in the JSX. To make it dynamic, connect to auth state:

```jsx
// Hardcoded (current):
<Link to="/settings/general">Travis Fuller</Link>
<p>Product Designer</p>
<Avatar src="/images/200x200.png" />

// Dynamic (connect to Redux / auth context):
const { admin } = useSelector(state => state.adminDetails);
<Link to="/settings/general">{admin?.name}</Link>
<p>{admin?.role}</p>
<Avatar src={admin?.avatar || "/images/200x200.png"} />
```

---

## 8. Menu — Navigation List

File: `src/app/layouts/Sideblock/Sidebar/Menu/index.jsx`

The scrollable navigation list. Manages which section is active using URL matching.

### How Active State is Detected

```js
const { pathname } = useLocation();
const navigation = getNavigation();   // Fresh call on every render

// Find which top-level group matches current URL
const activeGroup = navigation.find(item => isRouteActive(item.path, pathname));

// Find which collapsible child is active (for Accordion open state)
const activeCollapsible = activeGroup?.childs?.find(item =>
  isRouteActive(item.path, pathname)
);

// Accordion controlled state — keeps active group open
const [expanded, setExpanded] = useState(activeCollapsible?.path || null);
```

### Scroll to Active Item

On first mount, the active menu item automatically scrolls into view:

```js
useIsomorphicEffect(() => {
  const activeItem = ref?.current.querySelector("[data-menu-active=true]");
  activeItem?.scrollIntoView({ block: "center" });
}, []);
```

The `data-menu-active` attribute is set by `MenuItem` on the active `NavLink`.

---

## 9. Group — Section Renderer

File: `src/app/layouts/Sideblock/Sidebar/Menu/Group/index.jsx`

Renders one top-level navigation section (e.g., "Dashboards").

### Structure

```jsx
<div className="pt-3">
  <button onClick={toggle}>   {/* ← Section title — click to collapse/expand */}
    {data.title}
  </button>
  <Collapse in={isOpened}>   {/* ← Animated collapse */}
    {data.childs?.map(item => {
      switch (item.type) {
        case NAV_TYPE_COLLAPSE: return <CollapsibleItem data={item} />;
        case NAV_TYPE_ITEM:     return <MenuItem data={item} />;
        default:                return null;
      }
    })}
  </Collapse>
</div>
```

The section title is **sticky** (`sticky top-0 z-10`) so it stays visible when scrolling through long nav lists.

### Gradient Fade Effect

A subtle fade gradient is rendered below the sticky title:

```jsx
<div className="pointer-events-none absolute inset-x-0 -bottom-3 h-3 bg-linear-to-b from-white to-transparent" />
```

---

## 10. MenuItem — Clickable Nav Link

File: `src/app/layouts/Sideblock/Sidebar/Menu/Group/MenuItem.jsx`

Single clickable navigation link using React Router's `<NavLink>`.

### Active State Visual

When the route is active, two things happen:
1. Text color changes to `primary` color
2. A vertical left-edge bar appears:

```jsx
{isActive && (
  <div className="absolute bottom-1 top-1 w-1 bg-primary-600 dark:bg-primary-400 ltr:left-0 ltr:rounded-r-full rtl:right-0 rtl:rounded-l-lg" />
)}
```

### Dynamic Badge

Reads badge data from the route loader by nav node `id`:

```js
const info = useRouteLoaderData("root")?.[id]?.info;
// info = { val: 5, color: 'error' }
// If val is falsy → badge is hidden
```

### Auto-close on Mobile

```js
const handleMenuItemClick = () => lgAndDown && close();
// Closes sidebar when a menu item is clicked on tablet/mobile
```

---

## 11. CollapsibleItem — Accordion Sub-menu

File: `src/app/layouts/Sideblock/Sidebar/Menu/Group/CollapsibleItem/index.jsx`

Used for `NAV_TYPE_COLLAPSE` nodes — an expandable accordion item with child links.

### RTL Support

```js
const ChevronIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
// ↑ Chevron flips direction based on text direction
```

When open, the chevron rotates 90°:
```jsx
className={clsx("size-4 transition-transform", open && "ltr:rotate-90 rtl:-rotate-90")}
```

### i18n (Active)

Unlike `MenuItem`, CollapsibleItem **already uses** `useTranslation()`:
```js
const { t } = useTranslation();
const title = t(transKey) || data.title;   // Translates if key exists, else fallback
```

---

## 12. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `xl` (≥1280px) | Sidebar always open, overlay hidden, close button hidden |
| `lg` (≥1024px) and below | Sidebar closed by default, opens via toggle button, shows overlay when open |

### Breakpoint triggers

```js
// Provider: auto-close on resize to mobile
useDidUpdate(() => { lgAndDown && close(); }, [name]);

// Sidebar/index.jsx: close on breakpoint change too (double guard)
useDidUpdate(() => { isSidebarExpanded && closeSidebar(); }, [name]);

// MenuItem: close sidebar after click on mobile
const handleMenuItemClick = () => lgAndDown && close();
```

---

## 13. Customization Reference

| I want to change...              | Edit this file                                |
|----------------------------------|-----------------------------------------------|
| App logo in sidebar              | Replace `assets/appLogo.svg` and `assets/logotype.svg` |
| Profile name / role / avatar     | `Profile.jsx` → connect to Redux auth state   |
| Profile quick links              | `Profile.jsx` → edit the `links[]` array      |
| Sidebar width                    | CSS variable `--sidebar-width` in global styles |
| Active item color                | `MenuItem.jsx` → `text-primary-600` class     |
| Active indicator bar             | `MenuItem.jsx` → the `absolute` div with `bg-primary-600` |
| Section title style              | `Group/index.jsx` → `<button>` className      |
| Sidebar border vs shadow         | `theme.config.js` → `cardSkin: "bordered"` or `"shadow"` |
| Mobile overlay color/opacity     | `Sidebar/index.jsx` → Portal `div` className  |
| Auto-open breakpoint (xl)        | `SidebarProvider.jsx` → `xlAndUp` condition   |
