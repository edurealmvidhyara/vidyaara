/**
 * Deep comparison of two objects to detect changes
 * @param {Object} obj1 - First object to compare
 * @param {Object} obj2 - Second object to compare
 * @returns {boolean} - True if objects are different
 */
export const hasObjectChanged = (obj1, obj2) => {
  // Handle null/undefined cases
  if (obj1 === obj2) return false;
  if (!obj1 || !obj2) return true;

  // Get keys from both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if number of keys is different
  if (keys1.length !== keys2.length) return true;

  // Check each key
  for (let key of keys1) {
    if (!keys2.includes(key)) return true;

    const val1 = obj1[key];
    const val2 = obj2[key];

    // Handle arrays
    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) return true;
      for (let i = 0; i < val1.length; i++) {
        if (typeof val1[i] === "object" && typeof val2[i] === "object") {
          if (hasObjectChanged(val1[i], val2[i])) return true;
        } else if (val1[i] !== val2[i]) {
          return true;
        }
      }
    }
    // Handle nested objects
    else if (
      typeof val1 === "object" &&
      typeof val2 === "object" &&
      val1 !== null &&
      val2 !== null
    ) {
      if (hasObjectChanged(val1, val2)) return true;
    }
    // Handle primitive values
    else if (val1 !== val2) {
      return true;
    }
  }

  return false;
};

/**
 * Get changed fields between two objects
 * @param {Object} original - Original object
 * @param {Object} current - Current object
 * @returns {Object} - Object containing only changed fields
 */
export const getChangedFields = (original, current) => {
  const changes = {};

  const keys = new Set([...Object.keys(original), ...Object.keys(current)]);

  for (let key of keys) {
    const originalVal = original[key];
    const currentVal = current[key];

    // Handle arrays
    if (Array.isArray(originalVal) && Array.isArray(currentVal)) {
      if (JSON.stringify(originalVal) !== JSON.stringify(currentVal)) {
        changes[key] = currentVal;
      }
    }
    // Handle objects
    else if (
      typeof originalVal === "object" &&
      typeof currentVal === "object" &&
      originalVal !== null &&
      currentVal !== null
    ) {
      if (hasObjectChanged(originalVal, currentVal)) {
        changes[key] = currentVal;
      }
    }
    // Handle primitives
    else if (originalVal !== currentVal) {
      changes[key] = currentVal;
    }
  }

  return changes;
};

/**
 * Debounce function for form inputs
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Validate required fields in form data
 * @param {Object} formData - Form data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Object with validation results
 */
export const validateRequiredFields = (formData, requiredFields) => {
  const errors = {};
  let isValid = true;

  requiredFields.forEach((field) => {
    const value = formData[field];
    if (
      !value ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors[field] = `${field} is required`;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Auto-save functionality with change detection
 * @param {Object} formData - Current form data
 * @param {Object} lastSavedData - Last saved form data
 * @param {Function} saveFunction - Function to call for saving
 * @param {number} delay - Auto-save delay in milliseconds
 */
export const createAutoSave = (saveFunction, delay = 2000) => {
  let timeoutId;

  return (formData, lastSavedData) => {
    clearTimeout(timeoutId);

    if (hasObjectChanged(formData, lastSavedData)) {
      timeoutId = setTimeout(() => {
        saveFunction(formData);
      }, delay);
    }
  };
};
