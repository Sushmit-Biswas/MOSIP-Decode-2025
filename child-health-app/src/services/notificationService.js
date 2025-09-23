import toast, { Toaster } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.defaultOptions = {
      duration: 4000,
      position: 'top-center',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
        padding: '16px',
        fontWeight: '500',
        maxWidth: '500px',
      },
    };
    
    // Track active notifications to prevent duplicates
    this.activeNotifications = new Set();
    this.maxNotifications = 3;
    this.recentMessages = new Map(); // Track recent messages to prevent spam
  }

  // Helper method to check for duplicate messages
  isDuplicate(message, type) {
    const key = `${type}:${message}`;
    const now = Date.now();
    const lastShown = this.recentMessages.get(key);
    
    // Consider it duplicate if same message was shown in last 5 seconds
    if (lastShown && (now - lastShown) < 5000) {
      return true;
    }
    
    this.recentMessages.set(key, now);
    
    // Clean up old entries
    for (const [k, timestamp] of this.recentMessages.entries()) {
      if (now - timestamp > 30000) { // Remove entries older than 30 seconds
        this.recentMessages.delete(k);
      }
    }
    
    return false;
  }

  // Helper to manage notification limits
  manageNotificationLimit() {
    try {
      // Safely check for toast state
      if (toast && toast._state && toast._state.toasts) {
        const activeToasts = toast._state.toasts.filter(t => t.visible);
        
        // If we're at or above the limit, dismiss the oldest toast(s)
        while (activeToasts.length >= this.maxNotifications) {
          const oldestToast = activeToasts.shift();
          if (oldestToast) {
            toast.dismiss(oldestToast.id);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to manage notification limit:', error);
    }
  }

  success(message, options = {}) {
    if (this.isDuplicate(message, 'success')) {
      return null;
    }
    
    this.manageNotificationLimit();
    
    return toast.success(message, {
      ...this.defaultOptions,
      icon: '✅',
      style: {
        ...this.defaultOptions.style,
        background: '#10B981',
        color: '#fff',
      },
      dismiss: true, // Enable manual dismissal
      ...options,
    });
  }

  error(message, options = {}) {
    if (this.isDuplicate(message, 'error')) {
      return null;
    }
    
    this.manageNotificationLimit();
    
    return toast.error(message, {
      ...this.defaultOptions,
      icon: '❌',
      style: {
        ...this.defaultOptions.style,
        background: '#EF4444',
        color: '#fff',
      },
      duration: 6000, // Longer duration for errors
      dismiss: true, // Enable manual dismissal
      ...options,
    });
  }

  info(message, options = {}) {
    if (this.isDuplicate(message, 'info')) {
      return null;
    }
    
    this.manageNotificationLimit();
    
    return toast(message, {
      ...this.defaultOptions,
      icon: 'ℹ️',
      style: {
        ...this.defaultOptions.style,
        background: '#3B82F6',
        color: '#fff',
      },
      dismiss: true, // Enable manual dismissal
      ...options,
    });
  }

  warning(message, options = {}) {
    if (this.isDuplicate(message, 'warning')) {
      return null;
    }
    
    this.manageNotificationLimit();
    
    return toast(message, {
      ...this.defaultOptions,
      icon: '⚠️',
      style: {
        ...this.defaultOptions.style,
        background: '#F59E0B',
        color: '#fff',
      },
      dismiss: true, // Enable manual dismissal
      ...options,
    });
  }

  loading(message = 'Loading...', options = {}) {
    // Don't check for duplicates on loading messages as they need to be updated
    this.manageNotificationLimit();
    
    return toast.loading(message, {
      ...this.defaultOptions,
      style: {
        ...this.defaultOptions.style,
        background: '#6B7280',
        color: '#fff',
      },
      ...options,
    });
  }

  promise(promise, messages, options = {}) {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
      },
      {
        ...this.defaultOptions,
        ...options,
      }
    );
  }

  dismiss(toastId) {
    try {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    } catch (error) {
      console.warn('Failed to dismiss toast:', error);
    }
  }

  // Special notifications for app-specific events
  healthIdGenerated(healthId) {
    return this.success(
      `Health ID Generated: ${healthId}`,
      {
        duration: 8000,
        action: {
          label: 'Copy',
          onClick: () => {
            navigator.clipboard.writeText(healthId);
            this.info('Health ID copied to clipboard!');
          },
        },
      }
    );
  }

  syncProgress(completed, total) {
    return this.loading(
      `Syncing records... ${completed}/${total}`,
      {
        id: 'sync-progress',
      }
    );
  }

  syncComplete(successful, failed) {
    this.dismiss('sync-progress');
    if (failed === 0) {
      return this.success(`Successfully synced ${successful} records!`);
    } else {
      return this.warning(`Synced ${successful} records, ${failed} failed`);
    }
  }

  locationCaptured(accuracy) {
    return this.success(
      `Location captured (±${Math.round(accuracy)}m accuracy)`,
      {
        icon: '📍',
        duration: 3000,
      }
    );
  }

  locationFailed() {
    return this.warning(
      'Location access denied. Record will be saved without location.',
      {
        icon: '📍',
        duration: 5000,
      }
    );
  }

  authenticationRequired() {
    return this.error(
      'Authentication required. Please login to continue.',
      {
        duration: 6000,
      }
    );
  }

  offlineMode() {
    return this.info(
      'Working offline. Data will be synced when connection is restored.',
      {
        icon: '📱',
        duration: 5000,
      }
    );
  }

  connectionRestored() {
    return this.success(
      'Connection restored! Auto-sync starting...',
      {
        icon: '🌐',
        duration: 3000,
      }
    );
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export both the service and the Toaster component
export { Toaster };
export default notificationService;