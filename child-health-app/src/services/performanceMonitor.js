/**
 * Performance Monitoring Service
 * Tracks application performance metrics and user interactions
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.isEnabled = !import.meta.env.DEV; // Disable in development
    this.sessionId = this.generateSessionId();
    
    if (this.isEnabled) {
      this.initializePerformanceObserver();
      this.trackPageLoad();
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize Performance Observer for monitoring Core Web Vitals
   */
  initializePerformanceObserver() {
    // Only run in browsers that support PerformanceObserver
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor First Paint, First Contentful Paint
      this.observePerformanceEntries(['paint', 'largest-contentful-paint']);
      
      // Monitor First Input Delay
      this.observeFirstInputDelay();
      
      // Monitor Cumulative Layout Shift
      this.observeLayoutShift();
    }
  }

  observePerformanceEntries(entryTypes) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(entry.entryType, {
            name: entry.name,
            value: entry.value || entry.startTime,
            rating: this.getRating(entry.entryType, entry.value || entry.startTime)
          });
        });
      });

      observer.observe({ entryTypes });
    } catch (error) {
      console.warn('Performance Observer not supported for:', entryTypes);
    }
  }

  observeFirstInputDelay() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.recordMetric('first-input-delay', {
              value: fid,
              rating: this.getRating('first-input-delay', fid)
            });
          }
        });
      });

      observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('First Input Delay observation not supported');
    }
  }

  observeLayoutShift() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.recordMetric('cumulative-layout-shift', {
          value: clsValue,
          rating: this.getRating('cumulative-layout-shift', clsValue)
        });
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('Layout Shift observation not supported');
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation) {
            this.recordMetric('page-load', {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
              loadComplete: navigation.loadEventEnd - navigation.navigationStart,
              firstByte: navigation.responseStart - navigation.navigationStart,
              rating: this.getRating('page-load', navigation.loadEventEnd - navigation.navigationStart)
            });
          }
        }, 0);
      });
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(type, data) {
    const metric = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.push(metric);
    
    // Send to analytics in production
    if (this.isEnabled) {
      this.sendMetric(metric);
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('Performance Metric:', metric);
    }
  }

  /**
   * Get performance rating based on metric type and value
   */
  getRating(type, value) {
    const thresholds = {
      'first-contentful-paint': { good: 1800, needsImprovement: 3000 },
      'largest-contentful-paint': { good: 2500, needsImprovement: 4000 },
      'first-input-delay': { good: 100, needsImprovement: 300 },
      'cumulative-layout-shift': { good: 0.1, needsImprovement: 0.25 },
      'page-load': { good: 2000, needsImprovement: 4000 }
    };

    const threshold = thresholds[type];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Track user interaction metrics
   */
  trackInteraction(action, element, data = {}) {
    this.recordMetric('user-interaction', {
      action,
      element,
      ...data
    });
  }

  /**
   * Track form submission performance
   */
  trackFormSubmission(formName, success, duration, errors = []) {
    this.recordMetric('form-submission', {
      formName,
      success,
      duration,
      errors,
      rating: success ? 'good' : 'poor'
    });
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint, method, duration, status, size = 0) {
    this.recordMetric('api-call', {
      endpoint,
      method,
      duration,
      status,
      size,
      rating: this.getRating('api-call', duration)
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    if (performance.memory) {
      this.recordMetric('memory-usage', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      });
    }
  }

  /**
   * Send metric to analytics service
   */
  async sendMetric(metric) {
    try {
      // In production, send to your analytics service
      // For now, we'll just batch them and send periodically
      if (this.metrics.length >= 10) {
        await this.flushMetrics();
      }
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  /**
   * Flush accumulated metrics to server
   */
  async flushMetrics() {
    if (this.metrics.length === 0) return;

    try {
      const payload = {
        sessionId: this.sessionId,
        metrics: [...this.metrics],
        timestamp: Date.now()
      };

      // In production, send to your analytics endpoint
      // await fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      console.log('Performance metrics batch:', payload);
      
      // Clear metrics after sending
      this.metrics = [];
    } catch (error) {
      console.warn('Failed to flush performance metrics:', error);
    }
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary() {
    const summary = {
      sessionId: this.sessionId,
      totalMetrics: this.metrics.length,
      byType: {},
      ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
    };

    this.metrics.forEach(metric => {
      // Count by type
      summary.byType[metric.type] = (summary.byType[metric.type] || 0) + 1;
      
      // Count by rating
      if (metric.data.rating) {
        summary.ratings[metric.data.rating]++;
      }
    });

    return summary;
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;