// Import Dependencies
import { ChartBarIcon } from '@heroicons/react/24/outline';
import WidgetIcon from 'assets/nav-icons/widget.svg?react'

// Local Imports
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant';
import { getDashboardPath } from 'utils/urlUtils';
import UserIcon from 'assets/nav-icons/user.svg?react';
import DocumentEditIcon from 'assets/nav-icons/document.svg?react'
import OnboardingIcon from 'assets/nav-icons/onboarding.svg?react'

// ----------------------------------------------------------------------

/**
 * Returns the dashboards navigation tree.
 * Using a getter function (not a static object) so paths are always fresh
 * @returns {object} Navigation node
 */
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
            path: getDashboardPath('sales'),
            type: NAV_TYPE_ITEM,
            title: 'Sales',
            transKey: 'nav.dashboards.sales',
            Icon: ChartBarIcon,
        },
        {
            id: 'dashboards.category',
            path: getDashboardPath('category'),
            type: NAV_TYPE_ITEM,
            title: 'Category',
            transKey: 'nav.dashboards.category',
            Icon: WidgetIcon,
        },
        {
            id: 'dashboards.prompts',
            path: getDashboardPath('prompts'),
            type: NAV_TYPE_ITEM,
            title: 'Prompts',
            transKey: 'nav.dashboards.prompts',
            Icon: DocumentEditIcon,
        },
        {
            id: 'dashboards.users',
            path: getDashboardPath('users'),
            type: NAV_TYPE_ITEM,
            title: 'Users',
            transKey: 'nav.dashboards.users',
            Icon: UserIcon,
        },
        {
            id: 'dashboards.carousel',
            path: getDashboardPath('carousel'),
            type: NAV_TYPE_ITEM,
            title: 'Carousel',
            transKey: 'nav.dashboards.carousel',
            Icon: OnboardingIcon,
        }
    ],
});

// Static export for any consumer that still needs the plain object
export const dashboards = getDashboardsNavigation();
