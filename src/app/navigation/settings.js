// Import Dependencies
import { UserIcon } from '@heroicons/react/24/outline';
import { TbPalette } from 'react-icons/tb';

// Local Imports
import SettingIcon from 'assets/dualicons/setting.svg?react';
import { NAV_TYPE_ITEM } from 'constants/app.constant';
import { getSettingsPath } from 'utils/urlUtils';

// ----------------------------------------------------------------------

/**
 * Returns the settings navigation tree.
 * Using a getter function (not a static object) — `getSettingsNavigation()` pattern.
 * @returns {object} Navigation node
 */
export const getSettingsNavigation = () => ({
    id: 'settings',
    type: NAV_TYPE_ITEM,
    path: getSettingsPath(),
    title: 'Settings',
    transKey: 'nav.settings.settings',
    Icon: SettingIcon,
    childs: [
        {
            id: 'settings.general',
            type: NAV_TYPE_ITEM,
            path: getSettingsPath('general'),
            title: 'General',
            transKey: 'nav.settings.general',
            Icon: UserIcon,
        },
        {
            id: 'settings.appearance',
            type: NAV_TYPE_ITEM,
            path: getSettingsPath('appearance'),
            title: 'Appearance',
            transKey: 'nav.settings.appearance',
            Icon: TbPalette,
        },
    ],
});

// Static export for any consumer that still needs the plain object
export const settings = getSettingsNavigation();