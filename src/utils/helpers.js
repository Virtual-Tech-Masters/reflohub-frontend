/**
 * Utility functions for common operations
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeHtml = (text) => {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Format currency amount in cents to display format
 * @param {number} cents - Amount in cents
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (cents, currency = 'USD') => {
  if (typeof cents !== 'number' || isNaN(cents)) return '$0.00';
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount);
};

/**
 * Format date to consistent format
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date and time
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get user-friendly error message from error object
 * @param {Error} error - Error object from API
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error?.userMessage) {
    return error.userMessage;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    // Don't expose technical error messages
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('404')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('401') || error.message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Convert dollars to cents safely
 * @param {number|string} dollars - Amount in dollars
 * @returns {number} - Amount in cents
 */
export const dollarsToCents = (dollars) => {
  const num = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100);
};

/**
 * Convert percentage to basis points safely
 * @param {number|string} percent - Percentage (e.g., 15 for 15%)
 * @returns {number} - Basis points (e.g., 1500 for 15%)
 */
export const percentToBasisPoints = (percent) => {
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (isNaN(num) || num < 0 || num > 100) return 0;
  return Math.round(num * 100);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
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

