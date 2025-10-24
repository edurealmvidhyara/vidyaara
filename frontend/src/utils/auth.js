// Authentication utility functions

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} - Token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Check if user has a specific role
 * @param {Object} user - User object from Redux store
 * @param {string} role - Role to check for
 * @returns {boolean} - True if user has the specified role
 */
export const hasRole = (user, role) => {
  return user?.user?.role === role;
};

/**
 * Check if user is an instructor
 * @param {Object} user - User object from Redux store
 * @returns {boolean} - True if user is an instructor
 */
export const isInstructor = (user) => {
  return hasRole(user, "instructor");
};

/**
 * Clear authentication data - ONLY use during explicit logout
 * DO NOT use for error handling or API failures
 */
export const clearAuth = () => {
  const token = localStorage.getItem("token");
  localStorage.removeItem("token");
};

/**
 * Get user data from user object
 * @param {Object} user - User object from Redux store
 * @returns {Object|null} - User data or null
 */
export const getUserData = (user) => {
  return user?.user || null;
};
