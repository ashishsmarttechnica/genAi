// Local Imports
import { NAV_TYPE_ITEM } from 'constants/app.constant';
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react';
import { getDashboardPath } from 'utils/urlUtils';

// ----------------------------------------------------------------------

/**
 * Returns the flat base navigation array used by compact/icon-only sidebars.
 * @returns {Array<object>}
 */
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

// Static export for backward compatibility
export const baseNavigation = getBaseNavigation();
