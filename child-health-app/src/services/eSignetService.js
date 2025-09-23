/**
 * eSignet Service for MOSIP Integration
 * Handles authentication and user verification through eSignet
 */

class ESignetService {
  constructor() {
    this.baseURL = import.meta.env.VITE_ESIGNET_URL || 'https://esignet.example.com/api';
    this.clientId = import.meta.env.VITE_ESIGNET_CLIENT_ID || 'sehat-saathi';
    this.authData = null;
  }

  /**
   * Initialize OTP flow for authentication
   */
  async sendOTP(nationalId) {
    try {
      if (import.meta.env.DEV) {
        return await this.mockSendOTP(nationalId);
      }

      const response = await fetch(`${this.baseURL}/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-ID': this.clientId
        },
        body: JSON.stringify({
          nationalId,
          purpose: 'AUTHENTICATION',
          transactionType: 'LOGIN'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('eSignet OTP send failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOTP(nationalId, otp, transactionId) {
    try {
      if (import.meta.env.DEV) {
        return await this.mockAuthenticate(nationalId, otp);
      }

      const response = await fetch(`${this.baseURL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-ID': this.clientId
        },
        body: JSON.stringify({ nationalId, otp, transactionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.authData = data;
        this.storeAuthData(data);
      }

      return data;
    } catch (error) {
      console.error('eSignet OTP verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken) {
    try {
      if (import.meta.env.DEV) {
        return await this.mockGetUserProfile(accessToken);
      }

      const response = await fetch(`${this.baseURL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-ID': this.clientId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('eSignet profile fetch failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Store authentication data securely
   */
  storeAuthData(authData) {
    try {
      const dataToStore = {
        ...authData,
        timestamp: Date.now(),
        expiresAt: Date.now() + (authData.expiresIn * 1000)
      };
      localStorage.setItem('esignet_auth', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  /**
   * Get stored authentication data
   */
  getStoredAuthData() {
    try {
      const stored = localStorage.getItem('esignet_auth');
      if (!stored) return null;

      const authData = JSON.parse(stored);
      
      if (Date.now() > authData.expiresAt) {
        this.clearAuthData();
        return null;
      }

      return authData;
    } catch (error) {
      console.error('Failed to get stored auth data:', error);
      return null;
    }
  }

  /**
   * Clear stored authentication data
   */
  clearAuthData() {
    try {
      localStorage.removeItem('esignet_auth');
      this.authData = null;
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    const authData = this.getStoredAuthData();
    return authData && authData.success && authData.accessToken;
  }

  /**
   * Get current access token
   */
  getAccessToken() {
    const authData = this.getStoredAuthData();
    return authData ? authData.accessToken : null;
  }

  /**
   * Mock OTP send for development
   */
  async mockSendOTP(nationalId) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const transactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      transactionId,
      maskedMobile: '****1234',
      maskedEmail: '****@sehat-saathi.org',
      message: 'OTP sent successfully. Use 123456 or 000000 for demo.'
    };
  }

  /**
   * Mock authentication for development
   */
  async mockAuthenticate(nationalId, otp, userType = 'field_representative') {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const validOTPs = ['123456', '000000'];
    
    if (!validOTPs.includes(otp)) {
      return {
        success: false,
        error: 'Invalid OTP. Use 123456 or 000000 for demo.'
      };
    }

    const mockUser = this.generateMockUser(nationalId, userType);

    return {
      success: true,
      accessToken: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      refreshToken: `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: mockUser,
      scope: 'profile email phone',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Mock user profile for development
   */
  async mockGetUserProfile(accessToken) {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!accessToken || !accessToken.startsWith('mock_token_')) {
      return { success: false, error: 'Invalid access token' };
    }

    return {
      success: true,
      profile: {
        nationalId: '1234567890',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91-9876543210',
        dateOfBirth: '1990-01-01',
        gender: 'M',
        address: {
          line1: '123 Main Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'IN'
        },
        verified: true,
        verificationLevel: 'L1'
      }
    };
  }

  /**
   * Generate mock user data based on national ID
   */
  generateMockUser(nationalId, userType) {
    const mockUsers = {
      'ADMIN001': {
        nationalId: 'ADMIN001',
        name: 'Dr. Sarah Johnson',
        role: 'admin',
        email: 'sarah.johnson@sehat-saathi.org',
        phone: '+91-9876543210',
        department: 'Health Administration',
        designation: 'Chief Medical Officer'
      },
      'ADMIN123': {
        nationalId: 'ADMIN123',
        name: 'Dr. Rajesh Patel',
        role: 'admin',
        email: 'rajesh.patel@sehat-saathi.org',
        phone: '+91-9876543211',
        department: 'Public Health',
        designation: 'District Health Officer'
      },
      'admin': {
        nationalId: 'admin',
        name: 'System Administrator',
        role: 'admin',
        email: 'admin@sehat-saathi.org',
        phone: '+91-9876543212',
        department: 'IT Administration',
        designation: 'System Admin'
      },
      '2304715938': {
        nationalId: '2304715938',
        name: 'Priya Sharma',
        role: 'field_representative',
        email: 'priya.sharma@sehat-saathi.org',
        phone: '+91-9876543213',
        area: 'Rural Health Block A',
        supervisor: 'Dr. Sarah Johnson'
      },
      '1234567890': {
        nationalId: '1234567890',
        name: 'Amit Kumar',
        role: 'field_representative',
        email: 'amit.kumar@sehat-saathi.org',
        phone: '+91-9876543214',
        area: 'Urban Health Center B',
        supervisor: 'Dr. Rajesh Patel'
      }
    };

    return mockUsers[nationalId] || {
      nationalId,
      name: `User ${nationalId.slice(-4)}`,
      role: userType,
      email: `user${nationalId.slice(-4)}@sehat-saathi.org`,
      phone: `+91-98765${nationalId.slice(-5)}`,
      area: userType === 'field_representative' ? 'Field Area' : 'Administration',
      supervisor: userType === 'field_representative' ? 'Supervisor' : null,
      department: userType === 'admin' ? 'Health Department' : null
    };
  }

  /**
   * Logout user and clear authentication data
   */
  async logout() {
    try {
      if (!import.meta.env.DEV && this.authData) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authData.accessToken}`,
            'Client-ID': this.clientId
          }
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          accessToken: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          expiresIn: 3600
        };
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-ID': this.clientId
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const storedAuth = this.getStoredAuthData();
        if (storedAuth) {
          storedAuth.accessToken = data.accessToken;
          storedAuth.expiresAt = Date.now() + (data.expiresIn * 1000);
          this.storeAuthData(storedAuth);
        }
      }

      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return { success: false, error: error.message };
    }
  }
}

const eSignetService = new ESignetService();
export default eSignetService;