/**
 * @fileoverview URL utility functions for constructing navigation paths.
 * Centralizes all path definitions so navigation stays DRY and maintainable.
 */

// ----------------------------------------------------------------------

/**
 * Joins a base path with an optional sub-path segment.
 * @param {string} basePath - Root path (e.g. '/dashboards')
 * @param {string} [subPath=''] - Child segment (e.g. 'sales')
 * @returns {string} Combined path
 */
function buildPath(basePath, subPath = '') {
    if (!subPath) return basePath;
    const cleanSegment = subPath.startsWith('/') ? subPath.slice(1) : subPath;
    return `${basePath}/${cleanSegment}`;
}

// ----------------------------------------------------------------------

/**
 * Returns the dashboards base path or a child path.
 * @param {string} [subPath=''] - e.g. 'sales', 'home'
 * @returns {string}
 */
export function getDashboardPath(subPath = '') {
    return buildPath('/dashboards', subPath);
}


/**
 * Returns the category base path or a child path.
 * @param {*} subPath 
 * @returns 
 */
export function getcategoryPath(subPath = "") {
    return buildPath('category', subPath);
}


/**
 * Returns the settings base path or a child path.
 * @param {string} [subPath=''] - e.g. 'general', 'appearance'
 * @returns {string}
 */
export function getSettingsPath(subPath = '') {
    return buildPath('/settings', subPath);
}
