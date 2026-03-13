# Theme Configuration Guide

## Overview

This document explains how the default theme is configured in the application.
All theme defaults are set in a **single file** — change it once, the entire app reflects the update.

---

## Table of Contents

1. [File Location](#1-file-location)
2. [defaultTheme Object](#2-defaulttheme-object)
3. [Theme Mode](#3-theme-mode)
4. [Layout Options](#4-layout-options)
5. [Color Schemes](#5-color-schemes)
6. [Language Settings](#6-language-settings)
7. [Notification Settings](#7-notification-settings)
8. [How Theme is Applied](#8-how-theme-is-applied)
9. [Changing Defaults — Quick Reference](#9-changing-defaults--quick-reference)

---

## 1. File Location

```
src/configs/theme.config.js     ← Edit this to change theme defaults
src/constants/colors.constant.js ← Color palette definitions (do not edit unless adding new colors)
```

---

## 2. `defaultTheme` Object

The entire default theme is exported as one object:

```js
// src/configs/theme.config.js
export const defaultTheme = {
  themeMode: "system",
  isMonochrome: false,
  themeLayout: "sideblock",
  cardSkin: "bordered",
  darkColorScheme:    { name, ...colors[DEFAULT_DARK_COLOR] },
  lightColorScheme:   { name, ...colors[DEFAULT_LIGHT_COLOR] },
  primaryColorScheme: { name, ...colors[DEFAULT_PRIMARY_COLOR] },
  defaultLang: "en",
  fallbackLang: "en",
  notification: {
    isExpanded: false,
    position: "bottom-right",
    visibleToasts: 4,
  },
};
```

This object is consumed by `ThemeProvider` at app boot. User's saved preferences
(from `localStorage`) override these defaults at runtime.

---

## 3. Theme Mode

```js
themeMode: "system"
// Options: "light" | "dark" | "system"
```

| Value | Behavior |
|---|---|
| `"light"` | Always light mode |
| `"dark"` | Always dark mode |
| `"system"` | Follows OS preference automatically |

---

## 4. Layout Options

```js
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

## 5. Color Schemes

Three independent color schemes are configured via constant names:

```js
// Change these three constants at the top of theme.config.js:

const DEFAULT_DARK_COLOR = "cinder";
// Options: "cinder" | "navy" | "mirage" | "black" | "mint"

const DEFAULT_LIGHT_COLOR = "slate";
// Options: "slate" | "gray" | "neutral"

const DEFAULT_PRIMARY_COLOR = "blue";
// Options: "indigo" | "blue" | "green" | "amber" | "purple" | "rose"
```

> **Do not** change `darkColorScheme`, `lightColorScheme`, `primaryColorScheme` objects directly.
> Change the `DEFAULT_*_COLOR` constants at the top — the objects auto-update via spread.

### Color Palette Reference

All color values live in `src/constants/colors.constant.js`.
Each key (e.g., `"cinder"`, `"blue"`) maps to a full palette of CSS variable values.

To **add a new color**:
1. Add a new key + palette object in `colors.constant.js`
2. Reference it via the `DEFAULT_*_COLOR` constant

---

## 6. Language Settings

```js
defaultLang: "en",    // Language shown on first visit (no localStorage saved yet)
fallbackLang: "en",   // Fallback if a translation key is missing
```

Supported languages are configured separately in `src/i18n/config.js` and `src/i18n/langs.js`.
See `I18N_GUIDE.md` for the full language setup.

---

## 7. Notification Settings

```js
notification: {
  isExpanded: false,    // Toast expanded by default?
  position: "bottom-right", // Toast position on screen
  visibleToasts: 4,     // Max toasts shown simultaneously
}
```

| `position` options | Description |
|---|---|
| `"top-left"` | Top left corner |
| `"top-right"` | Top right corner |
| `"bottom-left"` | Bottom left corner |
| `"bottom-right"` | Bottom right corner (default) |
| `"top-center"` | Top center |
| `"bottom-center"` | Bottom center |

---

## 8. How Theme is Applied

```
theme.config.js (defaultTheme)
        ↓
ThemeProvider (app/contexts/theme/Provider.jsx)
        ↓
useThemeContext() hook        ← Any component can read theme values
        ↓
CSS variables on <html>      ← Colors, dark mode applied globally
```

User changes (e.g., switching to dark mode via UI) are saved to `localStorage`
and override `defaultTheme` on next load. Reset localStorage to restore defaults.

---

## 9. Changing Defaults — Quick Reference

| I want to change...          | Edit this                          |
|------------------------------|------------------------------------|
| Default light/dark/primary colors | `DEFAULT_*_COLOR` constants top of `theme.config.js` |
| Default theme mode (light/dark/system) | `themeMode` in `defaultTheme` |
| Default layout style | `themeLayout` in `defaultTheme` |
| Card appearance | `cardSkin` in `defaultTheme` |
| Default language | `defaultLang` in `defaultTheme` |
| Toast position/count | `notification` object in `defaultTheme` |
| Add a brand new color | New entry in `colors.constant.js` |
