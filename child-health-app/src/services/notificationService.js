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
      },
    };
  }

  success(message, options = {}) {
    return toast.success(message, {
      ...this.defaultOptions,
      icon: '✅',
      style: {
        ...this.defaultOptions.style,
        background: '#10B981',
        color: '#fff',
      },
      ...options,
    });
  }

  error(message, options = {}) {
    return toast.error(message, {
      ...this.defaultOptions,
      icon: '❌',
      style: {
        ...this.defaultOptions.style,
        background: '#EF4444',
        color: '#fff',
      },
      duration: 6000, // Longer duration for errors
      ...options,
    });
  }

  info(message, options = {}) {
    return toast(message, {
      ...this.defaultOptions,
      icon: 'ℹ️',
      style: {
        ...this.defaultOptions.style,
        background: '#3B82F6',
        color: '#fff',
      },
      ...options,
    });
  }

  warning(message, options = {}) {
    return toast(message, {
      ...this.defaultOptions,
      icon: '⚠️',
      style: {
        ...this.defaultOptions.style,
        background: '#F59E0B',
        color: '#fff',
      },
      ...options,
    });
  }

  loading(message = 'Loading...', options = {}) {
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
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
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