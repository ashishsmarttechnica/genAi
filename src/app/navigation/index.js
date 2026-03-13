// Import section-level navigation getter functions
import { getDashboardsNavigation } from './dashboards';
import { getSettingsNavigation } from './settings';
// ----------------------------------------------------------------------

/**
 * Returns the full navigation tree at call-time.
 * sidebar components call this inside useMemo.
 * Settings is excluded — it lives in its own AppLayout sidebar, not DynamicLayout.
 * @returns {Array<object>}
 */
export const getNavigation = () => [getDashboardsNavigation()];

/**
 * Static navigation array
 * NOTE: Sidebars should use getNavigation() instead of this.
 */
export const navigation = [getDashboardsNavigation, getSettingsNavigation];

// Re-export baseNavigation for convenience
export { baseNavigation } from './baseNavigation';
