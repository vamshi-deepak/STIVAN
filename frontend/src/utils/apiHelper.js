/**
 * API Helper Utilities
 * 
 * Provides consistent error handling and API response processing
 * across all pages in the STIVAN application.
 */

/**
 * Handles API errors consistently across the application
 * 
 * @param {Error} error - The error object from catch block
 * @param {Response} response - The fetch response object
 * @param {Function} showToast - Toast notification function
 * @param {Function} navigate - React Router navigate function
 * @returns {void}
 */
export const handleApiError = (error, response, showToast, navigate) => {
  // Handle authentication errors (401 Unauthorized)
  if (response?.status === 401) {
    showToast('error', 'Session expired. Please log in again.');
    localStorage.clear();
    setTimeout(() => {
      navigate('/login');
    }, 1500);
    return;
  }

  // Handle forbidden errors (403 Forbidden)
  if (response?.status === 403) {
    showToast('error', 'You do not have permission to perform this action.');
    return;
  }

  // Handle not found errors (404 Not Found)
  if (response?.status === 404) {
    showToast('error', 'The requested resource was not found.');
    return;
  }

  // Handle server errors (500+)
  if (response?.status >= 500) {
    showToast('error', 'Server error. Please try again later.');
    return;
  }

  // Handle network errors (no connection)
  if (error?.message === 'Failed to fetch') {
    showToast('error', 'Network error. Please check your internet connection.');
    return;
  }

  // Handle timeout errors
  if (error?.name === 'AbortError') {
    showToast('error', 'Request timed out. Please try again.');
    return;
  }

  // Handle specific error messages from API
  if (response?.error) {
    showToast('error', response.error);
    return;
  }

  // Handle validation errors
  if (response?.validationErrors) {
    const firstError = Object.values(response.validationErrors)[0];
    showToast('error', firstError || 'Validation error occurred.');
    return;
  }

  // Default generic error
  console.error('Unhandled API error:', error, response);
  showToast('error', 'An unexpected error occurred. Please try again.');
};

/**
 * Makes an authenticated API request with consistent error handling
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, body, etc.)
 * @param {Function} showToast - Toast notification function
 * @param {Function} navigate - React Router navigate function
 * @returns {Promise<Object>} - The response data or null on error
 */
export const apiRequest = async (url, options = {}, showToast, navigate) => {
  try {
    // Get auth token
    const token = localStorage.getItem('token');
    
    // Check if token exists
    if (!token) {
      showToast('error', 'Please log in to continue.');
      navigate('/login');
      return null;
    }

    // Prepare request options
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    };

    // Make request
    const response = await fetch(url, requestOptions);
    
    // Parse response
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      data = { error: 'Invalid response from server' };
    }

    // Handle response
    if (response.ok) {
      return data;
    } else {
      handleApiError(null, { status: response.status, error: data.error }, showToast, navigate);
      return null;
    }
  } catch (error) {
    handleApiError(error, null, showToast, navigate);
    return null;
  }
};

/**
 * Checks if user is authenticated
 * 
 * @returns {boolean} - True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Gets user data from localStorage
 * 
 * @returns {Object|null} - User data or null
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

/**
 * Updates user data in localStorage
 * 
 * @param {Object} updates - Updated user data
 * @returns {void}
 */
export const updateUserData = (updates) => {
  try {
    const currentData = getUserData() || {};
    const updatedData = { ...currentData, ...updates };
    localStorage.setItem('userData', JSON.stringify(updatedData));
  } catch (error) {
    console.error('Failed to update user data:', error);
  }
};

/**
 * Logs out user and clears storage
 * 
 * @param {Function} navigate - React Router navigate function
 * @returns {void}
 */
export const logout = (navigate) => {
  localStorage.clear();
  navigate('/login');
};

/**
 * Validates email format
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * 
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result { isValid, errors[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats date to readable string
 * 
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

/**
 * Truncates text to specified length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function to limit API calls
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default {
  handleApiError,
  apiRequest,
  isAuthenticated,
  getUserData,
  updateUserData,
  logout,
  isValidEmail,
  validatePassword,
  formatDate,
  truncateText,
  debounce
};
