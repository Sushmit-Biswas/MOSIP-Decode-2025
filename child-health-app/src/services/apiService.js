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
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`❌ API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`💥 API Request failed: ${endpoint}`, error);
      
      // Only use mock backend in development mode as fallback
      if (this.isDev && mockBackendService) {
        console.warn(`🔧 Using mock backend for: ${endpoint}`);
        try {
          return await mockBackendService.request(endpoint, options);
        } catch (mockError) {
          console.error('Mock backend also failed:', mockError);
          throw error; // Throw original error
        }
      }
      
      throw error;
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
    return this.request('/auth/esignet', {
      method: 'POST',
      body: JSON.stringify({ nationalId, otp })
    });
  }

  async sendOTP(nationalId) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ nationalId })
    });
  }

  async uploadRecords(records, authToken) {
    return this.request('/children/upload', {
      method: 'POST',
      body: JSON.stringify({ records }),
      headers: {
        ...this.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
  }

  async checkHealth() {
    return this.request('/health');
  }

  // Sync methods
  async getSyncStatus() {
    return this.request('/sync/status');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;