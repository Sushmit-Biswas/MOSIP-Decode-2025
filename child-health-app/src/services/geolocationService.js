/**
 * Enhanced Geolocation Service with fallback options and proper error handling
 * Implements GPS location capture for field data collection
 */

class GeolocationService {
  constructor() {
    this.lastKnownLocation = null;
    this.isWatchingLocation = false;
    this.watchId = null;
    this.locationUpdateCallbacks = [];
  }

  /**
   * Get current location with high accuracy
   * @param {Object} options - Geolocation options
   * @returns {Promise} Location data or error
   */
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000, // 1 minute cache
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!this.isGeolocationSupported()) {
        reject(new Error('Geolocation is not supported by this device/browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = this.formatLocationData(position);
          this.lastKnownLocation = locationData;
          resolve(locationData);
        },
        (error) => {
          reject(this.handleGeolocationError(error));
        },
        defaultOptions
      );
    });
  }

  /**
   * Get location with multiple accuracy attempts
   * First tries high accuracy, then falls back to lower accuracy
   */
  async getLocationWithFallback() {
    try {
      // First attempt: High accuracy
      return await this.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000
      });
    } catch (highAccuracyError) {
      console.warn('High accuracy location failed, trying standard accuracy:', highAccuracyError);
      
      try {
        // Second attempt: Standard accuracy
        return await this.getCurrentLocation({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache for fallback
        });
      } catch (standardError) {
        console.warn('Standard accuracy location failed:', standardError);
        
        // Third attempt: Use last known location if available
        if (this.lastKnownLocation) {
          return {
            ...this.lastKnownLocation,
            isFromCache: true,
            cacheAge: Date.now() - this.lastKnownLocation.timestamp
          };
        }
        
        throw new Error('Unable to determine location. Please enable location services and try again.');
      }
    }
  }

  /**
   * Start continuous location watching
   * Useful for tracking movement during field work
   */
  startLocationWatch(callback, options = {}) {
    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation is not supported');
    }

    if (this.isWatchingLocation) {
      this.stopLocationWatch();
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = this.formatLocationData(position);
        this.lastKnownLocation = locationData;
        this.notifyLocationUpdate(locationData);
        if (callback) callback(locationData);
      },
      (error) => {
        const errorInfo = this.handleGeolocationError(error);
        this.notifyLocationUpdate(null, errorInfo);
        if (callback) callback(null, errorInfo);
      },
      defaultOptions
    );

    this.isWatchingLocation = true;
    return this.watchId;
  }

  /**
   * Stop location watching
   */
  stopLocationWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatchingLocation = false;
    }
  }

  /**
   * Register callback for location updates
   */
  onLocationUpdate(callback) {
    this.locationUpdateCallbacks.push(callback);
    return () => {
      const index = this.locationUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all registered callbacks of location updates
   */
  notifyLocationUpdate(location, error = null) {
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(location, error);
      } catch (err) {
        console.error('Error in location update callback:', err);
      }
    });
  }

  /**
   * Format raw position data into structured location object
   */
  formatLocationData(position) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      formattedTime: new Date(position.timestamp).toISOString(),
      coordinateString: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
      accuracyCategory: this.getAccuracyCategory(position.coords.accuracy),
      isFromCache: false
    };
  }

  /**
   * Categorize location accuracy for user feedback
   */
  getAccuracyCategory(accuracy) {
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 10) return 'good';
    if (accuracy <= 50) return 'fair';
    if (accuracy <= 100) return 'poor';
    return 'very-poor';
  }

  /**
   * Get human-readable accuracy description
   */
  getAccuracyDescription(accuracy) {
    const category = this.getAccuracyCategory(accuracy);
    const descriptions = {
      'excellent': `Excellent (±${Math.round(accuracy)}m)`,
      'good': `Good (±${Math.round(accuracy)}m)`,
      'fair': `Fair (±${Math.round(accuracy)}m)`,
      'poor': `Poor (±${Math.round(accuracy)}m)`,
      'very-poor': `Very Poor (±${Math.round(accuracy)}m)`
    };
    return descriptions[category];
  }

  /**
   * Handle geolocation errors with detailed information
   */
  handleGeolocationError(error) {
    const errorMessages = {
      [GeolocationPositionError.PERMISSION_DENIED]: {
        code: 'PERMISSION_DENIED',
        message: 'Location access denied by user',
        userMessage: 'Please enable location permissions in your browser settings and try again.',
        canRetry: true
      },
      [GeolocationPositionError.POSITION_UNAVAILABLE]: {
        code: 'POSITION_UNAVAILABLE',
        message: 'Location information unavailable',
        userMessage: 'Unable to determine your location. Please check your GPS settings.',
        canRetry: true
      },
      [GeolocationPositionError.TIMEOUT]: {
        code: 'TIMEOUT',
        message: 'Location request timed out',
        userMessage: 'Location request took too long. Please try again.',
        canRetry: true
      }
    };

    const errorInfo = errorMessages[error.code] || {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown location error',
      userMessage: 'An unexpected error occurred while getting your location.',
      canRetry: true
    };

    return {
      ...errorInfo,
      originalError: error,
      timestamp: Date.now()
    };
  }

  /**
   * Check if geolocation is supported
   */
  isGeolocationSupported() {
    return 'geolocation' in navigator;
  }

  /**
   * Check location permission status
   */
  async getPermissionStatus() {
    if (!('permissions' in navigator)) {
      return 'unknown';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (err) {
      console.warn('Could not check permission status:', err);
      return 'unknown';
    }
  }

  /**
   * Request location permission explicitly
   */
  async requestLocationPermission() {
    const permissionStatus = await this.getPermissionStatus();
    
    if (permissionStatus === 'granted') {
      return true;
    }

    if (permissionStatus === 'denied') {
      return false;
    }

    // Try to trigger permission prompt by requesting location
    try {
      await this.getCurrentLocation({ timeout: 1000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get distance between two locations in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get last known location
   */
  getLastKnownLocation() {
    return this.lastKnownLocation;
  }

  /**
   * Clear stored location data
   */
  clearLocationData() {
    this.lastKnownLocation = null;
    this.stopLocationWatch();
  }

  /**
   * Generate location summary for display
   */
  getLocationSummary(location) {
    if (!location) return 'No location data';

    const { latitude, longitude, accuracy, isFromCache, cacheAge } = location;
    let summary = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    
    if (accuracy) {
      summary += ` (±${Math.round(accuracy)}m)`;
    }
    
    if (isFromCache && cacheAge) {
      const ageMinutes = Math.round(cacheAge / 60000);
      summary += ` [Cached ${ageMinutes}min ago]`;
    }
    
    return summary;
  }

  /**
   * Validate location data quality
   */
  validateLocationQuality(location, minAccuracy = 100) {
    if (!location || !location.latitude || !location.longitude) {
      return { valid: false, reason: 'No location data available' };
    }

    if (location.accuracy && location.accuracy > minAccuracy) {
      return { 
        valid: false, 
        reason: `Location accuracy too low (±${Math.round(location.accuracy)}m). Required: ±${minAccuracy}m` 
      };
    }

    if (location.isFromCache && location.cacheAge > 600000) { // 10 minutes
      return { 
        valid: false, 
        reason: 'Location data is too old (>10 minutes)' 
      };
    }

    return { valid: true };
  }
}

// Create singleton instance
const geolocationService = new GeolocationService();

export default geolocationService;