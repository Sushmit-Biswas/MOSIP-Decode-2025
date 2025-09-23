// Mock backend service for development mode
class MockBackendService {
  constructor() {
    this.isEnabled = import.meta.env.DEV;
    this.delay = 500; // Simulate network delay
  }

  async simulateDelay() {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay + Math.random() * 500));
    }
  }

  async authenticateWithESignet(nationalId, otp) {
    await this.simulateDelay();

    // Mock successful authentication for demo OTPs
    const validOTPs = ['123456', '000000'];
    if (!validOTPs.includes(otp)) {
      throw new Error('Invalid OTP');
    }

    // Mock user data based on National ID
    const users = {
      '2304715938': { name: 'Priya Sharma', role: 'field_representative' },
      '1234567890': { name: 'Amit Kumar', role: 'field_representative' },
      'admin123': { name: 'Dr. Sarah Johnson', role: 'admin' }
    };

    const user = users[nationalId] || { name: 'Test User', role: 'field_representative' };

    return {
      success: true,
      data: {
        token: `mock_token_${Date.now()}_${nationalId}`,
        user: {
          nationalId,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString()
        },
        expiresIn: 3600
      }
    };
  }

  async sendOTP(nationalId) {
    await this.simulateDelay();

    console.log(`🔧 Mock OTP sent for National ID: ${nationalId}`);
    console.log('📱 Use OTP: 123456 or 000000 for demo');

    return {
      success: true,
      message: 'OTP sent successfully',
      data: {
        transactionId: `mock_txn_${Date.now()}`,
        maskedMobile: '+91-****-***890',
        otpSent: true
      }
    };
  }

  async uploadRecords(records, authToken) {
    await this.simulateDelay();

    if (!authToken) {
      throw new Error('Authentication required');
    }

    console.log(`🔧 Mock upload: ${records.length} records`);

    // Simulate upload success for all records
    const successful = records.map(record => ({
      recordId: record.id,
      serverId: `mock_server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      healthId: record.healthId,
      uploadedAt: new Date().toISOString()
    }));

    return {
      success: true,
      data: {
        successful,
        failed: [],
        errors: [],
        totalUploaded: successful.length,
        message: `Successfully uploaded ${successful.length} records to server`
      }
    };
  }

  async checkHealth() {
    await this.simulateDelay();

    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mode: 'mock_development',
      message: 'Mock backend service is running'
    };
  }

  async getChildren(params = {}) {
    await this.simulateDelay();

    // Return mock empty data for admin dashboard
    return {
      success: true,
      data: {
        children: [],
        total: 0,
        page: 1,
        limit: 10,
        message: 'No synced records found (mock data)'
      }
    };
  }

  async request(endpoint, options = {}) {
    await this.simulateDelay();

    console.log(`🔧 Mock API request: ${endpoint}`);

    // Handle different endpoints
    if (endpoint.includes('/health')) {
      return this.checkHealth();
    }

    if (endpoint.includes('/children')) {
      return this.getChildren();
    }

    if (endpoint.includes('/auth/esignet')) {
      throw new Error('Use authenticateWithESignet method for authentication');
    }

    // Default response
    return {
      success: true,
      message: 'Mock response',
      data: null
    };
  }
}

// Create singleton instance
const mockBackendService = new MockBackendService();

export default mockBackendService;