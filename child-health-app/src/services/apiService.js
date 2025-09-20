// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = null;
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

  // Sync methods
  async uploadRecords(records, token) {
    return this.request('/sync/upload', {
      method: 'POST',
      body: JSON.stringify({
        records,
        token
      })
    });
  }

  async getSyncStatus() {
    return this.request('/sync/status');
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;