import toast from 'react-hot-toast';

/**
 * Show a success toast notification
 * @param {string} message - The success message to display
 * @param {object} options - Additional options for the toast
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - The warning message to display
 * @param {object} options - Additional options for the toast
 */
export const showWarning = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#F59E0B',
      color: '#fff',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show an error toast notification
 * @param {string} message - The error message to display
 * @param {object} options - Additional options for the toast
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show an info toast notification
 * @param {string} message - The info message to display
 * @param {object} options - Additional options for the toast
 */
export const showInfo = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Show a loading toast notification
 * @param {string} message - The loading message to display
 * @param {object} options - Additional options for the toast
 */
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6B7280',
      color: '#fff',
      fontWeight: '500',
    },
    ...options,
  });
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Promise-based toast for async operations
 * @param {Promise} promise - The promise to handle
 * @param {object} messages - Object containing success, error, and loading messages
 * @param {object} options - Additional options for the toast
 */
export const promiseToast = (promise, messages, options = {}) => {
  return toast.promise(promise, {
    loading: messages.loading || 'Loading...',
    success: messages.success || 'Success!',
    error: messages.error || 'Something went wrong!',
    ...options,
  });
};

// Default export with all toast functions
export default {
  success: showSuccess,
  warning: showWarning,
  error: showError,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  promise: promiseToast,
};
