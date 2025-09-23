// API service for backend communication
import mockBackendService from './mockBackendService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = null;
    this.isDev = import.meta.env.DEV;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    // Use mock backend in development mode for failed requests
    if (this.isDev) {
      try {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
          headers: this.getHeaders(),
          ...options
        };

        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.warn(`🔧 API request failed, using mock backend: ${endpoint}`, error.message);
        return await mockBackendService.request(endpoint, options);
      }
    } else {
      // Production mode - original behavior
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`API Request failed: ${endpoint}`, error);
        throw error;
      }
    }
  }

  // Children API methods
  async getChildren(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/children${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async createChild(childData) {
    return this.request('/children', {
      method: 'POST',
      body: JSON.stringify(childData)
    });
  }

  async getChildByHealthId(healthId) {
    return this.request(`/children/${healthId}`);
  }

  async downloadHealthBooklet(healthId, download = true) {
    const url = `${this.baseURL}/children/${healthId}/booklet?download=${download}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to download booklet: ${response.statusText}`);
    }

    return response.blob();
  }

  // Authentication methods
  async authenticateWithESignet(nationalId, otp) {
    if (this.isDev) {
      try {
        return await this.request('/auth/esignet', {
          method: 'POST',
          body: JSON.stringify({ nationalId, otp })
        });
      } catch (error) {
        console.warn('🔧 Using mock authentication due to backend error:', error.message);
        return await mockBackendService.authenticateWithESignet(nationalId, otp);
      }
    } else {
      return this.request('/auth/esignet', {
        method: 'POST',
        body: JSON.stringify({ nationalId, otp })
      });
    }
  }

  async sendOTP(nationalId) {
    if (this.isDev) {
      try {
        return await this.request('/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify({ nationalId })
        });
      } catch (error) {
        console.warn('🔧 Using mock OTP service due to backend error:', error.message);
        return await mockBackendService.sendOTP(nationalId);
      }
    } else {
      return this.request('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ nationalId })
      });
    }
  }

  async uploadRecords(records, authToken) {
    if (this.isDev) {
      try {
        return await this.request('/children/upload', {
          method: 'POST',
          body: JSON.stringify({ records }),
          headers: {
            ...this.getHeaders(),
            'Authorization': `Bearer ${authToken}`
          }
        });
      } catch (error) {
        console.warn('🔧 Using mock upload service due to backend error:', error.message);
        return await mockBackendService.uploadRecords(records, authToken);
      }
    } else {
      return this.request('/children/upload', {
        method: 'POST',
        body: JSON.stringify({ records }),
        headers: {
          ...this.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        }
      });
    }
  }

  async checkHealth() {
    if (this.isDev) {
      try {
        return await this.request('/health');
      } catch (error) {
        console.warn('🔧 Using mock health check due to backend error:', error.message);
        return await mockBackendService.checkHealth();
      }
    } else {
      return this.request('/health');
    }
  }

  // Sync methods
  async getSyncStatus() {
    return this.request('/sync/status');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;