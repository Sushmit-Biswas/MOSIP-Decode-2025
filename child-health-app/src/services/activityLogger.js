/**
 * Activity Logging Service for Admin Monitoring
 * Tracks field representative activities including data entry, syncing, location, etc.
 */

class ActivityLogger {
  constructor() {
    this.logKey = 'field_activity_logs';
    this.maxLogs = 5000; // Keep last 5000 activities
  }

  /**
   * Log field representative activity
   * @param {string} action - The action performed
   * @param {Object} details - Additional details about the action
   * @param {Object} user - User information
   * @param {Object} metadata - Additional metadata
   */
  logActivity(action, details = {}, user = null, metadata = {}) {
    try {
      const activity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        details,
        user: user || this.getCurrentUser(),
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          sessionId: this.getSessionId(),
          ...metadata
        },
        location: this.getCurrentLocation()
      };

      this.saveActivity(activity);
      return activity;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    try {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get current location if available
   */
  getCurrentLocation() {
    try {
      const locationData = localStorage.getItem('current_location');
      return locationData ? JSON.parse(locationData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save activity to localStorage
   */
  saveActivity(activity) {
    try {
      const existingLogs = this.getActivities();
      existingLogs.push(activity);

      // Keep only the latest activities
      if (existingLogs.length > this.maxLogs) {
        existingLogs.splice(0, existingLogs.length - this.maxLogs);
      }

      localStorage.setItem(this.logKey, JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  }

  /**
   * Get all activities
   */
  getActivities() {
    try {
      const logs = localStorage.getItem(this.logKey);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get activities with filters
   */
  getFilteredActivities(filters = {}) {
    const activities = this.getActivities();
    
    return activities.filter(activity => {
      // Filter by user ID
      if (filters.userId && activity.user?.nationalId !== filters.userId) {
        return false;
      }

      // Filter by user role
      if (filters.userRole && activity.user?.role !== filters.userRole) {
        return false;
      }

      // Filter by action
      if (filters.action && activity.action !== filters.action) {
        return false;
      }

      // Filter by date range
      if (filters.dateFrom && new Date(activity.timestamp) < new Date(filters.dateFrom)) {
        return false;
      }

      if (filters.dateTo && new Date(activity.timestamp) > new Date(filters.dateTo)) {
        return false;
      }

      // Filter by session
      if (filters.sessionId && activity.metadata?.sessionId !== filters.sessionId) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get activity statistics
   */
  getActivityStats(filters = {}) {
    const activities = this.getFilteredActivities(filters);
    
    const stats = {
      total: activities.length,
      users: new Set(activities.map(a => a.user?.nationalId).filter(Boolean)).size,
      sessions: new Set(activities.map(a => a.metadata?.sessionId).filter(Boolean)).size,
      actions: {},
      userActivity: {},
      dailyActivity: {},
      hourlyActivity: Array(24).fill(0)
    };

    activities.forEach(activity => {
      // Count actions
      stats.actions[activity.action] = (stats.actions[activity.action] || 0) + 1;

      // Count user activity
      if (activity.user?.nationalId) {
        const userId = activity.user.nationalId;
        if (!stats.userActivity[userId]) {
          stats.userActivity[userId] = {
            name: activity.user.name,
            role: activity.user.role,
            count: 0,
            lastActivity: activity.timestamp,
            actions: {}
          };
        }
        stats.userActivity[userId].count++;
        stats.userActivity[userId].actions[activity.action] = 
          (stats.userActivity[userId].actions[activity.action] || 0) + 1;
      }

      // Count daily activity
      const date = activity.timestamp.split('T')[0];
      stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;

      // Count hourly activity
      const hour = new Date(activity.timestamp).getHours();
      stats.hourlyActivity[hour]++;
    });

    return stats;
  }

  /**
   * Clear old activities (older than specified days)
   */
  clearOldActivities(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const activities = this.getActivities();
      const filteredActivities = activities.filter(
        activity => new Date(activity.timestamp) >= cutoffDate
      );

      localStorage.setItem(this.logKey, JSON.stringify(filteredActivities));
      return activities.length - filteredActivities.length;
    } catch (error) {
      console.error('Failed to clear old activities:', error);
      return 0;
    }
  }

  /**
   * Export activities as JSON
   */
  exportActivities(filters = {}) {
    const activities = this.getFilteredActivities(filters);
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      totalActivities: activities.length,
      filters,
      activities
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Predefined activity types for consistency
  static ACTIONS = {
    // Authentication
    LOGIN: 'login',
    LOGOUT: 'logout',
    AUTH_FAILED: 'auth_failed',

    // Data Entry
    CHILD_RECORD_CREATED: 'child_record_created',
    CHILD_RECORD_UPDATED: 'child_record_updated',
    CHILD_RECORD_DELETED: 'child_record_deleted',
    CHILD_RECORD_VIEWED: 'child_record_viewed',

    // Location
    LOCATION_CAPTURED: 'location_captured',
    LOCATION_FAILED: 'location_failed',
    LOCATION_UPDATED: 'location_updated',

    // Sync Operations
    SYNC_STARTED: 'sync_started',
    SYNC_COMPLETED: 'sync_completed',
    SYNC_FAILED: 'sync_failed',
    SYNC_PARTIAL: 'sync_partial',

    // File Operations
    PHOTO_CAPTURED: 'photo_captured',
    PDF_GENERATED: 'pdf_generated',
    DATA_EXPORTED: 'data_exported',

    // Navigation
    PAGE_VISITED: 'page_visited',
    SEARCH_PERFORMED: 'search_performed',
    FILTER_APPLIED: 'filter_applied',

    // System
    ERROR_OCCURRED: 'error_occurred',
    WARNING_DISPLAYED: 'warning_displayed',
    SETTINGS_CHANGED: 'settings_changed'
  };
}

// Create singleton instance
const activityLogger = new ActivityLogger();

export default activityLogger;