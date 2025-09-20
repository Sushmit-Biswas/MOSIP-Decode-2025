/**
 * eSignet Service - MOSIP eSignet OAuth 2.0/OIDC Integration
 * Based on MOSIP eSignet documentation and API patterns
 */

class ESignetService {
  constructor() {
    // eSignet configuration based on MOSIP documentation
    this.config = {
      baseUrl: import.meta.env.VITE_ESIGNET_URL || 'https://esignet.collab.mosip.net',
      clientId: import.meta.env.VITE_ESIGNET_CLIENT_ID || 'child-health-client',
      redirectUri: import.meta.env.VITE_ESIGNET_REDIRECT_URI || 'http://localhost:5173/auth/callback',
      scope: 'openid profile email',
      responseType: 'code',
      acrValues: 'mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code',
      display: 'page',
      prompt: 'login'
    };

    this.currentTransaction = null;
    this.authState = null;
  }

  /**
   * Initialize OAuth transaction (Step 1 of eSignet flow)
   */
  async initializeOAuthTransaction(userType = 'field_representative') {
    try {
      const nonce = this.generateNonce();
      const state = this.generateState();
      
      this.authState = { nonce, state, userType };

      const requestBody = {
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        scope: this.config.scope,
        responseType: this.config.responseType,
        nonce,
        state,
        acrValues: this.config.acrValues,
        display: this.config.display,
        prompt: this.config.prompt,
        claims: JSON.stringify({
          userinfo: {
            name: { essential: true },
            phone_number: { essential: false },
            email: { essential: true },
            gender: { essential: false },
            birthdate: { essential: false }
          },
          id_token: {}
        })
      };

      const response = await this.makeRequest('/v1/esignet/oauth/v2/oauth-details', {
        method: 'POST',
        body: JSON.stringify({
          id: 'mosip.esignet.oauth.detail.request',
          version: '1.0',
          requesttime: new Date().toISOString(),
          metadata: {},
          request: requestBody
        })
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].errorMessage);
      }

      this.currentTransaction = response.response;
      return {
        success: true,
        transactionId: this.currentTransaction.transactionId,
        authFactors: this.currentTransaction.authFactors,
        configs: this.currentTransaction.configs
      };

    } catch (error) {
      console.error('Failed to initialize OAuth transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize authentication'
      };
    }
  }

  /**
   * Send OTP to user's registered mobile/email (Step 2)
   */
  async sendOTP(transactionId, individualId, otpChannels = ['EMAIL', 'PHONE']) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const requestBody = {
        transactionId,
        individualId,
        otpChannels,
        captchaToken: null // Can be added if CAPTCHA is required
      };

      const response = await this.makeRequest('/v1/esignet/oauth/v2/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          id: 'mosip.esignet.send.otp.request',
          version: '1.0',
          requesttime: new Date().toISOString(),
          metadata: {},
          request: requestBody
        })
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].errorMessage);
      }

      return {
        success: true,
        otpTransactionId: response.response.transactionId,
        maskedMobile: response.response.maskedMobile,
        maskedEmail: response.response.maskedEmail,
        message: 'OTP sent successfully'
      };

    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        error: error.message || 'Failed to send OTP'
      };
    }
  }

  /**
   * Authenticate user with OTP (Step 3)
   */
  async authenticateWithOTP(transactionId, individualId, otp) {
    try {
      if (!transactionId || !individualId || !otp) {
        throw new Error('Transaction ID, Individual ID, and OTP are required');
      }

      const challengeList = [{
        authFactorType: 'OTP',
        challenge: otp,
        format: 'alpha-numeric'
      }];

      const requestBody = {
        transactionId,
        individualId,
        challengeList,
        captchaToken: null
      };

      const response = await this.makeRequest('/v1/esignet/oauth/v2/authenticate', {
        method: 'POST',
        body: JSON.stringify({
          id: 'mosip.esignet.authenticate.request',
          version: '1.0',
          requesttime: new Date().toISOString(),
          metadata: {},
          request: requestBody
        })
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].errorMessage);
      }

      return {
        success: true,
        transactionId: response.response.transactionId,
        status: response.response.status,
        consentAction: response.response.consentAction
      };

    } catch (error) {
      console.error('Authentication failed:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Generate authorization code (Step 4)
   */
  async generateAuthCode(transactionId, acceptedClaims = [], permittedScopes = ['openid', 'profile']) {
    try {
      const requestBody = {
        transactionId,
        acceptedClaims,
        permittedAuthorizeScopes: permittedScopes
      };

      const response = await this.makeRequest('/v1/esignet/oauth/v2/auth-code', {
        method: 'POST',
        body: JSON.stringify({
          id: 'mosip.esignet.auth.code.request',
          version: '1.0',
          requesttime: new Date().toISOString(),
          metadata: {},
          request: requestBody
        })
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].errorMessage);
      }

      return {
        success: true,
        authCode: response.response.code,
        state: response.response.state,
        redirectUri: response.response.redirectUri
      };

    } catch (error) {
      console.error('Failed to generate auth code:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate authorization code'
      };
    }
  }

  /**
   * Exchange authorization code for tokens (Step 5)
   */
  async exchangeCodeForTokens(authCode) {
    try {
      const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: this.generateClientAssertion()
      });

      const response = await fetch(`${this.config.baseUrl}/v1/esignet/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: requestBody
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Token exchange failed');
      }

      // Decode the ID token to get user info
      const userInfo = this.decodeJWT(data.id_token);

      return {
        success: true,
        accessToken: data.access_token,
        idToken: data.id_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        user: {
          sub: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          nationalId: userInfo.national_id || userInfo.sub,
          role: userInfo.role || this.authState?.userType || 'field_representative'
        }
      };

    } catch (error) {
      console.error('Token exchange failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to exchange code for tokens'
      };
    }
  }

  /**
   * Complete authentication flow (simplified method)
   */
  async completeAuthentication(individualId, otp, userType = 'field_representative') {
    try {
      // Step 1: Initialize transaction
      const initResult = await this.initializeOAuthTransaction(userType);
      if (!initResult.success) {
        return initResult;
      }

      // Step 2: Send OTP (skip if already sent)
      // const otpResult = await this.sendOTP(initResult.transactionId, individualId);
      // if (!otpResult.success) {
      //   return otpResult;
      // }

      // Step 3: Authenticate with OTP
      const authResult = await this.authenticateWithOTP(initResult.transactionId, individualId, otp);
      if (!authResult.success) {
        return authResult;
      }

      // Step 4: Generate auth code
      const codeResult = await this.generateAuthCode(authResult.transactionId);
      if (!codeResult.success) {
        return codeResult;
      }

      // Step 5: Exchange code for tokens
      const tokenResult = await this.exchangeCodeForTokens(codeResult.authCode);
      if (!tokenResult.success) {
        return tokenResult;
      }

      // Store authentication state
      this.storeAuthData(tokenResult);

      return {
        success: true,
        user: tokenResult.user,
        accessToken: tokenResult.accessToken,
        message: 'Authentication successful'
      };

    } catch (error) {
      console.error('Complete authentication failed:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken) {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/esignet/oidc/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  generateNonce() {
    return 'nonce_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  generateState() {
    return 'state_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  generateClientAssertion() {
    // In production, this should be a proper JWT signed with your private key
    // For development, return a mock assertion
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: this.config.clientId,
      sub: this.config.clientId,
      aud: `${this.config.baseUrl}/v1/esignet/oauth/v2/token`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300
    };

    // Mock JWT for development - in production, properly sign this
    return btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.mock_signature';
  }

  decodeJWT(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return {};
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  storeAuthData(tokenData) {
    localStorage.setItem('auth_token', tokenData.accessToken);
    localStorage.setItem('user_info', JSON.stringify(tokenData.user));
    localStorage.setItem('auth_expires', (Date.now() + (tokenData.expiresIn * 1000)).toString());
  }

  getStoredAuthData() {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    const expires = localStorage.getItem('auth_expires');

    if (!token || !userInfo || !expires) {
      return null;
    }

    if (Date.now() > parseInt(expires)) {
      this.clearAuthData();
      return null;
    }

    return {
      token,
      user: JSON.parse(userInfo)
    };
  }

  clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_expires');
    this.currentTransaction = null;
    this.authState = null;
  }

  isAuthenticated() {
    return this.getStoredAuthData() !== null;
  }
}

// Create singleton instance
const eSignetService = new ESignetService();

export default eSignetService;