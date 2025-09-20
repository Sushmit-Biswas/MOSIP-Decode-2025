const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock eSignet configuration based on actual MOSIP patterns
const ESIGNET_CONFIG = {
  clientId: 'child-health-client',
  redirectUri: process.env.CLIENT_URL || 'http://localhost:5173',
  scope: 'openid profile',
  responseType: 'code',
  acrValues: 'mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code',
  display: 'page',
  prompt: 'login',
  otpChannels: ['EMAIL', 'PHONE'],
  otpLength: 6,
  resendOtpTimeoutInSec: 180
};

// In-memory session store (in production, use Redis or database)
const sessions = new Map();

// POST /api/auth/oauth-details - Initialize OAuth transaction (MOSIP pattern)
router.post('/oauth-details', async (req, res) => {
  try {
    const {
      clientId,
      redirectUri,
      scope,
      responseType,
      nonce,
      state,
      acrValues,
      claims,
      display,
      prompt
    } = req.body;

    // Validate client
    if (clientId !== ESIGNET_CONFIG.clientId) {
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_client_id',
          errorMessage: 'Invalid client ID'
        }]
      });
    }

    // Generate transaction ID (MOSIP style)
    const transactionId = 'txn_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    
    // Store transaction details
    sessions.set(transactionId, {
      clientId,
      redirectUri,
      scope,
      responseType,
      nonce,
      state,
      acrValues,
      claims,
      display,
      prompt,
      status: 'ACTIVE',
      createdAt: new Date(),
      authFactors: ['OTP'], // Available auth factors
      configs: ESIGNET_CONFIG
    });

    res.json({
      id: null,
      version: null,
      responsetime: new Date().toISOString(),
      metadata: null,
      response: {
        transactionId,
        authFactors: [
          {
            type: 'OTP',
            count: 1,
            subTypes: []
          }
        ],
        configs: {
          'mosip.esignet.send.otp.channels': ESIGNET_CONFIG.otpChannels.join(','),
          'mosip.esignet.otp.length': ESIGNET_CONFIG.otpLength.toString(),
          'mosip.esignet.resend.otp.delay.secs': ESIGNET_CONFIG.resendOtpTimeoutInSec.toString()
        }
      },
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      errors: [{
        errorCode: 'server_error',
        errorMessage: error.message
      }]
    });
  }
});

// POST /api/auth/send-otp - Send OTP (MOSIP eSignet pattern)
router.post('/send-otp', async (req, res) => {
  try {
    const { transactionId, individualId, otpChannels, captchaToken } = req.body;

    if (!transactionId || !individualId || !otpChannels) {
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_request',
          errorMessage: 'Missing required parameters: transactionId, individualId, otpChannels'
        }]
      });
    }

    const session = sessions.get(transactionId);
    if (!session || session.status !== 'ACTIVE') {
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_transaction',
          errorMessage: 'Invalid or expired transaction'
        }]
      });
    }

    // Simulate OTP sending (in real implementation, integrate with SMS/Email service)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpTransactionId = 'otp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    // Update session with OTP details
    session.otp = {
      value: otp,
      transactionId: otpTransactionId,
      individualId,
      channels: otpChannels,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
      verified: false
    };
    
    sessions.set(transactionId, session);

    // In development, return OTP in response for testing
    const responseData = {
      transactionId: otpTransactionId,
      maskedMobile: individualId.includes('@') ? null : individualId.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
      maskedEmail: individualId.includes('@') ? individualId.replace(/(.{3}).+@/, '$1***@') : null
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.otp = otp; // Include OTP in development
    }

    res.json({
      id: null,
      version: null,
      responsetime: new Date().toISOString(),
      metadata: null,
      response: responseData,
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      errors: [{
        errorCode: 'server_error',
        errorMessage: error.message
      }]
    });
  }
});

// POST /api/auth/authenticate - Authenticate user with OTP (MOSIP pattern)
router.post('/authenticate', async (req, res) => {
  try {
    const { transactionId, individualId, challengeList, captchaToken } = req.body;

    if (!transactionId || !individualId || !challengeList) {
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_request',
          errorMessage: 'Missing required parameters'
        }]
      });
    }

    const session = sessions.get(transactionId);
    if (!session || session.status !== 'ACTIVE') {
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_transaction',
          errorMessage: 'Invalid or expired transaction'
        }]
      });
    }

    // Extract OTP challenge
    const otpChallenge = challengeList.find(c => c.authFactorType === 'OTP');
    if (!otpChallenge) {
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_challenge',
          errorMessage: 'OTP challenge not found'
        }]
      });
    }

    const { otp } = session;
    if (!otp) {
      return res.status(400).json({
        errors: [{
          errorCode: 'otp_not_sent',
          errorMessage: 'OTP not sent for this transaction'
        }]
      });
    }

    // Check OTP expiry
    if (new Date() > otp.expiresAt) {
      return res.status(400).json({
        errors: [{
          errorCode: 'otp_expired',
          errorMessage: 'OTP has expired'
        }]
      });
    }

    // Verify OTP
    const providedOtp = otpChallenge.challenge;
    if (providedOtp !== otp.value) {
      otp.attempts = (otp.attempts || 0) + 1;
      
      if (otp.attempts >= 3) {
        session.status = 'FAILED';
        sessions.set(transactionId, session);
        
        return res.status(400).json({
          errors: [{
            errorCode: 'max_otp_attempts_exceeded',
            errorMessage: 'Maximum OTP verification attempts exceeded'
          }]
        });
      }
      
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_otp',
          errorMessage: `Invalid OTP. ${3 - otp.attempts} attempts remaining.`
        }]
      });
    }

    // OTP verified successfully
    otp.verified = true;
    session.status = 'AUTHENTICATED';
    session.authenticatedAt = new Date();
    session.individualId = individualId;
    sessions.set(transactionId, session);

    res.json({
      id: null,
      version: null,
      responsetime: new Date().toISOString(),
      metadata: null,
      response: {
        transactionId,
        status: 'SUCCESS',
        consentAction: 'CAPTURE'
      },
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      errors: [{
        errorCode: 'server_error',
        errorMessage: error.message
      }]
    });
  }
});

// POST /api/auth/auth-code - Generate authorization code (MOSIP pattern)
router.post('/auth-code', async (req, res) => {
  try {
    const { transactionId, acceptedClaims, permittedAuthorizeScopes } = req.body;

    const session = sessions.get(transactionId);
    if (!session || session.status !== 'AUTHENTICATED') {
      return res.status(400).json({
        errors: [{
          errorCode: 'invalid_transaction',
          errorMessage: 'Transaction not authenticated'
        }]
      });
    }

    // Generate authorization code
    const authCode = 'auth_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    
    session.authCode = authCode;
    session.acceptedClaims = acceptedClaims;
    session.permittedScopes = permittedAuthorizeScopes;
    session.codeGeneratedAt = new Date();
    sessions.set(transactionId, session);

    res.json({
      id: null,
      version: null,
      responsetime: new Date().toISOString(),
      metadata: null,
      response: {
        code: authCode,
        state: session.state,
        redirectUri: session.redirectUri
      },
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      errors: [{
        errorCode: 'server_error',
        errorMessage: error.message
      }]
    });
  }
});

// POST /api/auth/token - Exchange code for tokens (OAuth 2.0 / OIDC)
router.post('/token', async (req, res) => {
  try {
    const { grant_type, code, redirect_uri, client_id, client_assertion, client_assertion_type } = req.body;

    if (grant_type !== 'authorization_code') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code grant type is supported'
      });
    }

    // Find session by auth code
    let sessionData = null;
    for (const [txnId, session] of sessions.entries()) {
      if (session.authCode === code) {
        sessionData = session;
        break;
      }
    }

    if (!sessionData) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid authorization code'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        sub: sessionData.individualId,
        aud: sessionData.clientId,
        iss: 'child-health-esignet',
        scope: sessionData.scope,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      },
      process.env.JWT_SECRET || 'default-secret'
    );

    const idToken = jwt.sign(
      {
        sub: sessionData.individualId,
        aud: sessionData.clientId,
        iss: 'child-health-esignet',
        nonce: sessionData.nonce,
        auth_time: Math.floor(sessionData.authenticatedAt.getTime() / 1000),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        // Claims
        name: 'Field Representative',
        role: 'field_agent',
        national_id: sessionData.individualId
      },
      process.env.JWT_SECRET || 'default-secret'
    );

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
      scope: sessionData.scope
    });
  } catch (error) {
    res.status(500).json({
      error: 'server_error',
      error_description: error.message
    });
  }
});

// Legacy simplified endpoints for backward compatibility
// POST /api/auth/esignet - Simplified eSignet authentication
router.post('/esignet', async (req, res) => {
  try {
    const { nationalId, otp } = req.body;

    if (!nationalId || !otp) {
      return res.status(400).json({
        success: false,
        error: 'National ID and OTP are required'
      });
    }

    // For demo purposes, accept any national ID with specific OTP
    if (otp === '123456' || otp === '000000') {
      const token = jwt.sign(
        {
          sub: nationalId,
          iss: 'child-health-esignet',
          aud: 'child-health-client',
          role: 'field_agent',
          name: 'Field Representative',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        },
        process.env.JWT_SECRET || 'default-secret'
      );
      
      res.json({
        success: true,
        data: {
          token,
          user: {
            nationalId,
            name: 'Field Representative',
            role: 'field_agent'
          }
        },
        message: 'Authentication successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'invalid_otp',
        message: 'Invalid OTP. Use 123456 for testing.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'authentication_failed',
      message: error.message
    });
  }
});

// POST /api/auth/send-otp - Simplified OTP sending (legacy)
router.post('/send-otp', async (req, res) => {
  try {
    const { nationalId } = req.body;

    if (!nationalId) {
      return res.status(400).json({
        success: false,
        error: 'National ID is required'
      });
    }

    // Simulate OTP sending
    res.json({
      success: true,
      message: 'OTP sent successfully to your registered mobile number',
      nationalId,
      // In development, include test OTP
      ...(process.env.NODE_ENV === 'development' && { otp: '123456' })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      message: error.message
    });
  }
});

module.exports = router;