/**
 * Returns true when the user has completed organization type and size.
 * These fields unlock personalized AI analysis and recommendations.
 *
 * @param {{ org_type?: string|null, org_size?: string|null }|null|undefined} user
 * @returns {boolean}
 */
export function isOrgProfileComplete(user) {
  return Boolean(user?.org_type && user?.org_size);
}

/**
 * Post-login / post-register destination.
 * Incomplete org profile → profile onboarding; otherwise dashboard.
 *
 * @param {{ org_type?: string|null, org_size?: string|null }|null|undefined} user
 * @returns {string}
 */
export function postAuthDestination(user) {
  return isOrgProfileComplete(user) ? '/dashboard' : '/profile?onboarding=1';
}
