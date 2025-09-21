/**/**/**

 * Sehat Saathi eSignet Authentication Service

 * Mock implementation for MOSIP hackathon demo * eSignet Service - MOSIP eSignet OAuth 2.0/OIDC Integration * eSignet Service - MOSIP eSignet OAuth 2.0/OIDC Integration

 */

 * Enhanced with robust mock authentication for development * Enhanced with robust mock authentication for development

class ESignetService {

  constructor() { */ */

    this.mockMode = true; // Always use mock for demo

    

    // Valid demo credentials

    this.validCredentials = {class ESignetService {class ESignetService {

      admin: {

        'ADMIN001': { name: 'Dr. Sarah Johnson', role: 'admin', email: 'admin@sehat-saathi.org' },  constructor() {  constructor() {

        'ADMIN123': { name: 'Dr. Rajesh Patel', role: 'admin', email: 'rajesh@sehat-saathi.org' },

        'admin': { name: 'System Administrator', role: 'admin', email: 'sysadmin@sehat-saathi.org' }    // eSignet configuration    // eSignet configuration

      },

      field_representative: {    this.config = {    this.config = {

        '2304715938': { name: 'Priya Sharma', role: 'field_representative', email: 'priya@sehat-saathi.org' },

        '1234567890': { name: 'Amit Kumar', role: 'field_representative', email: 'amit@sehat-saathi.org' },      baseUrl: import.meta.env.VITE_ESIGNET_URL || 'https://esignet.collab.mosip.net',      baseUrl: import.meta.env.VITE_ESIGNET_URL || 'https://esignet.collab.mosip.net',

        'FR001': { name: 'Field Representative', role: 'field_representative', email: 'field@sehat-saathi.org' }

      }      clientId: import.meta.env.VITE_ESIGNET_CLIENT_ID || 'child-health-client',      clientId: import.meta.env.VITE_ESIGNET_CLIENT_ID || 'child-health-client',

    };

          redirectUri: import.meta.env.VITE_ESIGNET_REDIRECT_URI || 'http://localhost:5173/auth/callback',      redirectUri: import.meta.env.VITE_ESIGNET_REDIRECT_URI || 'http://localhost:5173/auth/callback',

    this.validOTPs = ['123456', '000000'];

  }      scope: 'openid profile email',      scope: 'openid profile email',



  /**      responseType: 'code',      responseType: 'code',

   * Initialize OAuth transaction - Mock version

   */      acrValues: 'mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code',      acrValues: 'mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code',

  async initializeOAuthTransaction(userType = 'field_representative') {

    // Simulate API delay      display: 'page',      display: 'page',

    await new Promise(resolve => setTimeout(resolve, 500));

          prompt: 'login'      prompt: 'login'

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        };    };

    return {

      success: true,

      transactionId,

      authFactors: ['OTP'],    this.currentTransaction = null;    this.currentTransaction = null;

      configs: { otpTimeout: 180 }

    };    this.authState = null;    this.authState = null;

  }

    this.mockMode = true; // Enable mock mode by default for development    this.mockMode = true; // Enable mock mode by default for development

  /**

   * Send OTP - Mock version  }  }

   */

  async sendOTP(transactionId, individualId) {

    // Simulate API delay

    await new Promise(resolve => setTimeout(resolve, 800));  /**  /**

    

    return {   * Mock authentication for development   * Mock authentication for development

      success: true,

      otpTransactionId: transactionId,   */   */

      maskedMobile: '****1234',

      maskedEmail: '****@sehat-saathi.org',  async mockAuthenticate(nationalId, otp, userType = 'field_representative') {  async mockAuthenticate(nationalId, otp, userType = 'field_representative') {

      message: 'OTP sent successfully. Use 123456 or 000000 for demo.'

    };    // Simulate network delay    // Simulate network delay

  }

    await new Promise(resolve => setTimeout(resolve, 1000));    await new Promise(resolve => setTimeout(resolve, 1000));

  /**

   * Complete authentication

   */

  async completeAuthentication(nationalId, otp, userType = 'field_representative') {    // Valid test credentials    // Valid test credentials

    try {

      // Simulate network delay    const validCredentials = {    const validCredentials = {

      await new Promise(resolve => setTimeout(resolve, 1000));

      admin: {      admin: {

      // Check credentials

      const userCredentials = this.validCredentials[userType];        'ADMIN001': { name: 'Dr. Sarah Johnson', role: 'admin', email: 'admin@sehat-saathi.org' },        'ADMIN001': { name: 'Dr. Sarah Johnson', role: 'admin', email: 'admin@sehat-saathi.org' },

      const user = userCredentials?.[nationalId] || userCredentials?.[nationalId.toUpperCase()];

        'ADMIN123': { name: 'Dr. Rajesh Patel', role: 'admin', email: 'rajesh@sehat-saathi.org' },        'ADMIN123': { name: 'Dr. Rajesh Patel', role: 'admin', email: 'rajesh@sehat-saathi.org' },

      if (!user) {

        return {        'admin': { name: 'System Administrator', role: 'admin', email: 'sysadmin@sehat-saathi.org' }        'admin': { name: 'System Administrator', role: 'admin', email: 'sysadmin@sehat-saathi.org' }

          success: false,

          error: `Invalid ${userType.replace('_', ' ')} National ID. Use ${Object.keys(userCredentials).join(', ')} for testing.`      },      },

        };

      }      field_representative: {      field_representative: {



      if (!this.validOTPs.includes(otp)) {        '2304715938': { name: 'Priya Sharma', role: 'field_representative', email: 'priya@sehat-saathi.org' },        '2304715938': { name: 'Priya Sharma', role: 'field_representative', email: 'priya@sehat-saathi.org' },

        return {

          success: false,        '1234567890': { name: 'Amit Kumar', role: 'field_representative', email: 'amit@sehat-saathi.org' },        '1234567890': { name: 'Amit Kumar', role: 'field_representative', email: 'amit@sehat-saathi.org' },

          error: 'Invalid OTP. Use 123456 or 000000 for testing.'

        };        'FR001': { name: 'Field Representative', role: 'field_representative', email: 'field@sehat-saathi.org' }        'FR001': { name: 'Field Representative', role: 'field_representative', email: 'field@sehat-saathi.org' }

      }

      }      }

      // Generate auth result

      const authResult = {    };    };

        success: true,

        user: {

          nationalId: nationalId,

          name: user.name,    // Valid OTPs    // Valid OTPs

          email: user.email,

          role: user.role,    const validOTPs = ['123456', '000000'];    const validOTPs = ['123456', '000000'];

          verified: true,

          loginTime: new Date().toISOString()

        },

        accessToken: `token_${userType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,    // Check credentials    // Check credentials

        refreshToken: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

        expiresIn: 3600,    const userCredentials = validCredentials[userType];    const userCredentials = validCredentials[userType];

        tokenType: 'Bearer'

      };    const user = userCredentials?.[nationalId] || userCredentials?.[nationalId.toUpperCase()];    const user = userCredentials?.[nationalId] || userCredentials?.[nationalId.toUpperCase()];



      // Store authentication data

      this.storeAuthData(authResult);

          if (!user) {    if (!user) {

      // Log activity

      this.logAuthActivity(authResult.user, 'login');      return {      return {



      return authResult;        success: false,        success: false,



    } catch (error) {        error: `Invalid ${userType.replace('_', ' ')} National ID. Use ${Object.keys(userCredentials).join(', ')} for testing.`        error: `Invalid ${userType.replace('_', ' ')} National ID. Use ${Object.keys(userCredentials).join(', ')} for testing.`

      console.error('Authentication error:', error);

      return {      };      };

        success: false,

        error: 'Authentication failed. Please try again.'    }    }

      };

    }

  }

    if (!validOTPs.includes(otp)) {    if (!validOTPs.includes(otp)) {

  /**

   * Store authentication data      return {      return {

   */

  storeAuthData(tokenData) {        success: false,        success: false,

    const expires = Date.now() + (tokenData.expiresIn * 1000);

            error: 'Invalid OTP. Use 123456 or 000000 for testing.'        error: 'Invalid OTP. Use 123456 or 000000 for testing.'

    localStorage.setItem('auth_token', tokenData.accessToken);

    localStorage.setItem('user_info', JSON.stringify(tokenData.user));      };      };

    localStorage.setItem('auth_expires', expires.toString());

    localStorage.setItem('refresh_token', tokenData.refreshToken || '');    }    }

  }



  /**

   * Get stored authentication data    // Generate mock tokens    // Generate mock tokens

   */

  getStoredAuthData() {    const accessToken = `mock_${userType}_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;    const accessToken = `mock_${userType}_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const token = localStorage.getItem('auth_token');

    const userInfo = localStorage.getItem('user_info');    const refreshToken = `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;    const refreshToken = `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const expires = localStorage.getItem('auth_expires');



    if (!token || !userInfo || !expires) {

      return null;    const authResult = {    const authResult = {

    }

      success: true,      success: true,

    if (Date.now() > parseInt(expires)) {

      this.clearAuthData();      user: {      user: {

      return null;

    }        nationalId: nationalId,        nationalId: nationalId,



    return {        name: user.name,        name: user.name,

      token,

      user: JSON.parse(userInfo)        email: user.email,        email: user.email,

    };

  }        role: user.role,        role: user.role,



  /**        verified: true,        verified: true,

   * Clear authentication data

   */        loginTime: new Date().toISOString()        loginTime: new Date().toISOString()

  clearAuthData() {

    const authData = this.getStoredAuthData();      },      },

    if (authData) {

      this.logAuthActivity(authData.user, 'logout');      accessToken,      accessToken,

    }

          refreshToken,      refreshToken,

    localStorage.removeItem('auth_token');

    localStorage.removeItem('user_info');      expiresIn: 3600,      expiresIn: 3600,

    localStorage.removeItem('auth_expires');

    localStorage.removeItem('refresh_token');      tokenType: 'Bearer'      tokenType: 'Bearer'

  }

    };    };

  /**

   * Check if user is authenticated

   */

  isAuthenticated() {    // Store authentication data    // Store authentication data

    return this.getStoredAuthData() !== null;

  }    this.storeAuthData(authResult);    this.storeAuthData(authResult);



  /**

   * Get current user

   */    return authResult;    return authResult;

  getCurrentUser() {

    const authData = this.getStoredAuthData();  }  }

    return authData?.user || null;

  }



  /**  /**  /**

   * Log authentication activities for admin tracking

   */   * Initialize OAuth transaction (Step 1 of eSignet flow)   * Initialize OAuth transaction (Step 1 of eSignet flow)

  logAuthActivity(user, action) {

    try {   */   */

      const activityLog = {

        timestamp: new Date().toISOString(),  async initializeOAuthTransaction(userType = 'field_representative') {  async initializeOAuthTransaction(userType = 'field_representative') {

        userId: user.nationalId,

        userName: user.name,    if (this.mockMode) {    if (this.mockMode) {

        userRole: user.role,

        action: action,      // Return mock transaction for development      // Return mock transaction for development

        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

        userAgent: navigator.userAgent,      const mockTransactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;      const mockTransactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        location: 'Location pending...' // Will be updated by geolocation service

      };      this.currentTransaction = { transactionId: mockTransactionId };      this.currentTransaction = { transactionId: mockTransactionId };



      // Store in localStorage for admin dashboard      this.authState = { userType, transactionId: mockTransactionId };      this.authState = { userType, transactionId: mockTransactionId };

      const existingLogs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');

      existingLogs.push(activityLog);            

      

      // Keep only last 100 logs      return {      return {

      if (existingLogs.length > 100) {

        existingLogs.splice(0, existingLogs.length - 100);        success: true,        success: true,

      }

              transactionId: mockTransactionId,        transactionId: mockTransactionId,

      localStorage.setItem('auth_activity_logs', JSON.stringify(existingLogs));

              authFactors: ['OTP'],        authFactors: ['OTP'],

      console.log(`Sehat Saathi Auth: ${action} for ${user.name} (${user.role})`);

    } catch (error) {        configs: { otpTimeout: 180 }        configs: { otpTimeout: 180 }

      console.error('Failed to log auth activity:', error);

    }      };      };

  }

    }    }

  /**

   * Get authentication activity logs (for admin dashboard)

   */

  getAuthActivityLogs() {    try {    try {

    try {

      return JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');      const nonce = this.generateNonce();      const nonce = this.generateNonce();

    } catch (error) {

      console.error('Failed to get auth activity logs:', error);      const state = this.generateState();      const state = this.generateState();

      return [];

    }            

  }

}      this.authState = { nonce, state, userType };      this.authState = { nonce, state, userType };



// Create singleton instance

const eSignetService = new ESignetService();

      const requestBody = {      const requestBody = {

export default eSignetService;
        clientId: this.config.clientId,        clientId: this.config.clientId,

        redirectUri: this.config.redirectUri,        redirectUri: this.config.redirectUri,

        scope: this.config.scope,        scope: this.config.scope,

        responseType: this.config.responseType,        responseType: this.config.responseType,

        nonce,        nonce,

        state,        state,

        acrValues: this.config.acrValues,        acrValues: this.config.acrValues,

        display: this.config.display,        display: this.config.display,

        prompt: this.config.prompt,        prompt: this.config.prompt,

        claims: JSON.stringify({        claims: JSON.stringify({

          userinfo: {          userinfo: {

            name: { essential: true },            name: { essential: true },

            phone_number: { essential: false },            phone_number: { essential: false },

            email: { essential: true },            email: { essential: true },

            gender: { essential: false },            gender: { essential: false },

            birthdate: { essential: false }            birthdate: { essential: false }

          },          },

          id_token: {}          id_token: {}

        })        })

      };      };



      const response = await this.makeRequest('/v1/esignet/oauth/v2/oauth-details', {      const response = await this.makeRequest('/v1/esignet/oauth/v2/oauth-details', {

        method: 'POST',        method: 'POST',

        body: JSON.stringify({        body: JSON.stringify({

          id: 'mosip.esignet.oauth.detail.request',          id: 'mosip.esignet.oauth.detail.request',

          version: '1.0',          version: '1.0',

          requesttime: new Date().toISOString(),          requesttime: new Date().toISOString(),

          metadata: {},          metadata: {},

          request: requestBody          request: requestBody

        })        })

      });      });



      if (response.errors && response.errors.length > 0) {      if (response.errors && response.errors.length > 0) {

        throw new Error(response.errors[0].errorMessage);        throw new Error(response.errors[0].errorMessage);

      }      }



      this.currentTransaction = response.response;      this.currentTransaction = response.response;

      return {      return {

        success: true,        success: true,

        transactionId: this.currentTransaction.transactionId,        transactionId: this.currentTransaction.transactionId,

        authFactors: this.currentTransaction.authFactors,        authFactors: this.currentTransaction.authFactors,

        configs: this.currentTransaction.configs        configs: this.currentTransaction.configs

      };      };



    } catch (error) {    } catch (error) {

      console.error('Failed to initialize OAuth transaction, falling back to mock:', error);      console.error('Failed to initialize OAuth transaction, falling back to mock:', error);

      // Fallback to mock mode      // Fallback to mock mode

      this.mockMode = true;      this.mockMode = true;

      return this.initializeOAuthTransaction(userType);      return this.initializeOAuthTransaction(userType);

    }    }

  }  }



  /**  /**

   * Send OTP to user's registered mobile/email (Step 2)   * Send OTP to user's registered mobile/email (Step 2)

   */   */

  async sendOTP(transactionId, individualId, otpChannels = ['EMAIL', 'PHONE']) {  async sendOTP(transactionId, individualId, otpChannels = ['EMAIL', 'PHONE']) {

    if (this.mockMode) {    if (this.mockMode) {

      // Simulate OTP sending      // Simulate OTP sending

      await new Promise(resolve => setTimeout(resolve, 800));      await new Promise(resolve => setTimeout(resolve, 800));

            

      return {      return {

        success: true,        success: true,

        otpTransactionId: transactionId,        otpTransactionId: transactionId,

        maskedMobile: '****1234',        maskedMobile: '****1234',

        maskedEmail: '****@sehat-saathi.org',        maskedEmail: '****@sehat-saathi.org',

        message: 'Mock OTP sent successfully. Use 123456 or 000000.'        message: 'Mock OTP sent successfully. Use 123456 or 000000.'

      };      };

    }    }



    try {    try {

      if (!transactionId) {      if (!transactionId) {

        throw new Error('Transaction ID is required');        throw new Error('Transaction ID is required');

      }      }



      const requestBody = {      const requestBody = {

        transactionId,        transactionId,

        individualId,        individualId,

        otpChannels,        otpChannels,

        captchaToken: null        captchaToken: null

      };      };



      const response = await this.makeRequest('/v1/esignet/oauth/v2/send-otp', {      const response = await this.makeRequest('/v1/esignet/oauth/v2/send-otp', {

        method: 'POST',        method: 'POST',

        body: JSON.stringify({        body: JSON.stringify({

          id: 'mosip.esignet.send.otp.request',          id: 'mosip.esignet.send.otp.request',

          version: '1.0',          version: '1.0',

          requesttime: new Date().toISOString(),          requesttime: new Date().toISOString(),

          metadata: {},          metadata: {},

          request: requestBody          request: requestBody

        })        })

      });      });



      if (response.errors && response.errors.length > 0) {      if (response.errors && response.errors.length > 0) {

        throw new Error(response.errors[0].errorMessage);        throw new Error(response.errors[0].errorMessage);

      }      }



      return {      return {

        success: true,        success: true,

        otpTransactionId: response.response.transactionId,        otpTransactionId: response.response.transactionId,

        maskedMobile: response.response.maskedMobile,        maskedMobile: response.response.maskedMobile,

        maskedEmail: response.response.maskedEmail,        maskedEmail: response.response.maskedEmail,

        message: 'OTP sent successfully'        message: 'OTP sent successfully'

      };      };



    } catch (error) {    } catch (error) {

      console.error('Failed to send OTP, using mock mode:', error);      console.error('Failed to send OTP, using mock mode:', error);

      this.mockMode = true;      this.mockMode = true;

      return this.sendOTP(transactionId, individualId, otpChannels);      return this.sendOTP(transactionId, individualId, otpChannels);

    }    }

  }  }



  /**  /**

   * Complete authentication flow (simplified method)   * Authenticate user with OTP (Step 3)

   */   */

  async completeAuthentication(individualId, otp, userType = 'field_representative') {  async authenticateWithOTP(transactionId, individualId, otp) {

    if (this.mockMode) {    if (this.mockMode) {

      return this.mockAuthenticate(individualId, otp, userType);      // Mock authentication for development

    }      return this.mockAuthenticate(individualId, otp, this.authState?.userType || 'field_representative');

    }

    try {

      // Step 1: Initialize transaction if not already done    try {

      if (!this.currentTransaction) {      if (!transactionId || !individualId || !otp) {

        const initResult = await this.initializeOAuthTransaction(userType);        throw new Error('Transaction ID, Individual ID, and OTP are required');

        if (!initResult.success) {      }

          return initResult;

        }      const challengeList = [{

      }        authFactorType: 'OTP',

        challenge: otp,

      // Step 3: Authenticate with OTP (simplified for mock)        format: 'alpha-numeric'

      const authResult = { success: true, transactionId: this.currentTransaction.transactionId };      }];



      // Step 4: Generate auth code      const requestBody = {

      const codeResult = { success: true, authCode: 'mock_auth_code' };        transactionId,

        individualId,

      // Step 5: Exchange code for tokens        challengeList,

      const tokenResult = {        captchaToken: null

        success: true,      };

        accessToken: `mock_token_${Date.now()}`,

        user: {      const response = await this.makeRequest('/v1/esignet/oauth/v2/authenticate', {

          nationalId: individualId,        method: 'POST',

          name: 'Mock User',        body: JSON.stringify({

          role: userType          id: 'mosip.esignet.authenticate.request',

        },          version: '1.0',

        expiresIn: 3600          requesttime: new Date().toISOString(),

      };          metadata: {},

          request: requestBody

      // Store authentication state        })

      this.storeAuthData(tokenResult);      });



      return {      if (response.errors && response.errors.length > 0) {

        success: true,        throw new Error(response.errors[0].errorMessage);

        user: tokenResult.user,      }

        accessToken: tokenResult.accessToken,

        message: 'Authentication successful'      return {

      };        success: true,

        transactionId: response.response.transactionId,

    } catch (error) {        status: response.response.status,

      console.error('Complete authentication failed, using mock:', error);        consentAction: response.response.consentAction

      this.mockMode = true;      };

      return this.mockAuthenticate(individualId, otp, userType);

    }    } catch (error) {

  }      console.error('Authentication failed, using mock:', error);

      this.mockMode = true;

  /**      return this.mockAuthenticate(individualId, otp, this.authState?.userType || 'field_representative');

   * Helper Methods    }

   */  }

  generateNonce() {

    return 'nonce_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);  /**

  }   * Generate authorization code (Step 4)

   */

  generateState() {  async generateAuthCode(transactionId, acceptedClaims = [], permittedScopes = ['openid', 'profile']) {

    return 'state_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);    try {

  }      const requestBody = {

        transactionId,

  async makeRequest(endpoint, options = {}) {        acceptedClaims,

    try {        permittedAuthorizeScopes: permittedScopes

      const url = `${this.config.baseUrl}${endpoint}`;      };

      const response = await fetch(url, {

        headers: {      const response = await this.makeRequest('/v1/esignet/oauth/v2/auth-code', {

          'Content-Type': 'application/json',        method: 'POST',

          'Accept': 'application/json',        body: JSON.stringify({

          ...options.headers          id: 'mosip.esignet.auth.code.request',

        },          version: '1.0',

        timeout: 10000, // 10 second timeout          requesttime: new Date().toISOString(),

        ...options          metadata: {},

      });          request: requestBody

        })

      if (!response.ok) {      });

        const errorText = await response.text();

        throw new Error(`HTTP ${response.status}: ${errorText}`);      if (response.errors && response.errors.length > 0) {

      }        throw new Error(response.errors[0].errorMessage);

      }

      return await response.json();

    } catch (error) {      return {

      console.error('Network request failed:', error);        success: true,

      throw error;        authCode: response.response.code,

    }        state: response.response.state,

  }        redirectUri: response.response.redirectUri

      };

  storeAuthData(tokenData) {

    const authData = {    } catch (error) {

      token: tokenData.accessToken,      console.error('Failed to generate auth code:', error);

      user: tokenData.user,      return {

      expires: Date.now() + (tokenData.expiresIn * 1000),        success: false,

      refreshToken: tokenData.refreshToken,        error: error.message || 'Failed to generate authorization code'

      loginTime: Date.now()      };

    };    }

      }

    localStorage.setItem('auth_token', tokenData.accessToken);

    localStorage.setItem('user_info', JSON.stringify(tokenData.user));  /**

    localStorage.setItem('auth_expires', authData.expires.toString());   * Exchange authorization code for tokens (Step 5)

    if (tokenData.refreshToken) {   */

      localStorage.setItem('refresh_token', tokenData.refreshToken);  async exchangeCodeForTokens(authCode) {

    }    try {

          const requestBody = new URLSearchParams({

    // Log authentication for admin tracking        grant_type: 'authorization_code',

    this.logAuthActivity(tokenData.user, 'login');        code: authCode,

  }        redirect_uri: this.config.redirectUri,

        client_id: this.config.clientId,

  getStoredAuthData() {        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',

    const token = localStorage.getItem('auth_token');        client_assertion: this.generateClientAssertion()

    const userInfo = localStorage.getItem('user_info');      });

    const expires = localStorage.getItem('auth_expires');

      const response = await fetch(`${this.config.baseUrl}/v1/esignet/oauth/v2/token`, {

    if (!token || !userInfo || !expires) {        method: 'POST',

      return null;        headers: {

    }          'Content-Type': 'application/x-www-form-urlencoded',

          'Accept': 'application/json'

    if (Date.now() > parseInt(expires)) {        },

      this.clearAuthData();        body: requestBody

      return null;      });

    }

      const data = await response.json();

    return {

      token,      if (!response.ok) {

      user: JSON.parse(userInfo)        throw new Error(data.error_description || data.error || 'Token exchange failed');

    };      }

  }

      // Decode the ID token to get user info

  clearAuthData() {      const userInfo = this.decodeJWT(data.id_token);

    const authData = this.getStoredAuthData();

    if (authData) {      return {

      this.logAuthActivity(authData.user, 'logout');        success: true,

    }        accessToken: data.access_token,

            idToken: data.id_token,

    localStorage.removeItem('auth_token');        tokenType: data.token_type,

    localStorage.removeItem('user_info');        expiresIn: data.expires_in,

    localStorage.removeItem('auth_expires');        user: {

    localStorage.removeItem('refresh_token');          sub: userInfo.sub,

    this.currentTransaction = null;          name: userInfo.name,

    this.authState = null;          email: userInfo.email,

  }          nationalId: userInfo.national_id || userInfo.sub,

          role: userInfo.role || this.authState?.userType || 'field_representative'

  isAuthenticated() {        }

    return this.getStoredAuthData() !== null;      };

  }

    } catch (error) {

  getCurrentUser() {      console.error('Token exchange failed:', error);

    const authData = this.getStoredAuthData();      return {

    return authData?.user || null;        success: false,

  }        error: error.message || 'Failed to exchange code for tokens'

      };

  /**    }

   * Log authentication activities for admin tracking  }

   */

  logAuthActivity(user, action) {  /**

    try {   * Get user profile information

      const activityLog = {   */

        timestamp: new Date().toISOString(),  async getUserProfile(accessToken) {

        userId: user.nationalId,    try {

        userName: user.name,      if (this.mockMode) {

        userRole: user.role,        const authData = this.getStoredAuthData();

        action: action,        return authData?.user || null;

        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,      }

        userAgent: navigator.userAgent,

        location: 'Unknown' // Will be updated by geolocation service      const response = await fetch(`${this.config.baseUrl}/v1/esignet/oidc/userinfo`, {

      };        headers: {

          'Authorization': `Bearer ${accessToken}`,

      // Store in localStorage for admin dashboard          'Accept': 'application/json'

      const existingLogs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');        }

      existingLogs.push(activityLog);      });

      

      // Keep only last 100 logs      if (!response.ok) {

      if (existingLogs.length > 100) {        throw new Error('Failed to fetch user profile');

        existingLogs.splice(0, existingLogs.length - 100);      }

      }

            return await response.json();

      localStorage.setItem('auth_activity_logs', JSON.stringify(existingLogs));    } catch (error) {

            console.error('Failed to get user profile:', error);

      console.log(`Auth activity logged: ${action} for ${user.name} (${user.role})`);      const authData = this.getStoredAuthData();

    } catch (error) {      return authData?.user || null;

      console.error('Failed to log auth activity:', error);    }

    }  }

  }

  /**

  /**   * Helper Methods

   * Get authentication activity logs (for admin dashboard)   */

   */  generateNonce() {

  getAuthActivityLogs() {    return 'nonce_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

    try {  }

      return JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');

    } catch (error) {  generateState() {

      console.error('Failed to get auth activity logs:', error);    return 'state_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

      return [];  }

    }

  }  generateClientAssertion() {

}    // In production, this should be a proper JWT signed with your private key

    // For development, return a mock assertion

// Create singleton instance    const header = { alg: 'RS256', typ: 'JWT' };

const eSignetService = new ESignetService();    const payload = {

      iss: this.config.clientId,

export default eSignetService;      sub: this.config.clientId,
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
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        timeout: 10000, // 10 second timeout
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Network request failed:', error);
      throw error;
    }
  }

  storeAuthData(tokenData) {
    const authData = {
      token: tokenData.accessToken,
      user: tokenData.user,
      expires: Date.now() + (tokenData.expiresIn * 1000),
      refreshToken: tokenData.refreshToken,
      loginTime: Date.now()
    };
    
    localStorage.setItem('auth_token', tokenData.accessToken);
    localStorage.setItem('user_info', JSON.stringify(tokenData.user));
    localStorage.setItem('auth_expires', authData.expires.toString());
    if (tokenData.refreshToken) {
      localStorage.setItem('refresh_token', tokenData.refreshToken);
    }
    
    // Log authentication for admin tracking
    this.logAuthActivity(tokenData.user, 'login');
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
    const authData = this.getStoredAuthData();
    if (authData) {
      this.logAuthActivity(authData.user, 'logout');
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_expires');
    localStorage.removeItem('refresh_token');
    this.currentTransaction = null;
    this.authState = null;
  }

  isAuthenticated() {
    return this.getStoredAuthData() !== null;
  }

  getCurrentUser() {
    const authData = this.getStoredAuthData();
    return authData?.user || null;
  }

  /**
   * Log authentication activities for admin tracking
   */
  logAuthActivity(user, action) {
    try {
      const activityLog = {
        timestamp: new Date().toISOString(),
        userId: user.nationalId,
        userName: user.name,
        userRole: user.role,
        action: action,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userAgent: navigator.userAgent,
        location: 'Unknown' // Will be updated by geolocation service
      };

      // Store in localStorage for admin dashboard
      const existingLogs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');
      existingLogs.push(activityLog);
      
      // Keep only last 100 logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('auth_activity_logs', JSON.stringify(existingLogs));
      
      console.log(`Auth activity logged: ${action} for ${user.name} (${user.role})`);
    } catch (error) {
      console.error('Failed to log auth activity:', error);
    }
  }

  /**
   * Get authentication activity logs (for admin dashboard)
   */
  getAuthActivityLogs() {
    try {
      return JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');
    } catch (error) {
      console.error('Failed to get auth activity logs:', error);
      return [];
    }
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