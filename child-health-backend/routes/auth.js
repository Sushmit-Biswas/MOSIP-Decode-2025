const express = require('express');
const router = express.Router();

// POST /api/auth/esignet - Mock eSignet authentication
router.post('/esignet', async (req, res) => {
  try {
    const { nationalId, otp } = req.body;

    if (!nationalId || !otp) {
      return res.status(400).json({
        success: false,
        error: 'National ID and OTP are required'
      });
    }

    // Mock authentication - accept any national ID with OTP "123456"
    if (otp === '123456') {
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      res.json({
        success: true,
        data: {
          token: mockToken,
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
        error: 'Invalid OTP',
        message: 'Please check your OTP and try again'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
});

// POST /api/auth/send-otp - Mock OTP sending
router.post('/send-otp', async (req, res) => {
  try {
    const { nationalId } = req.body;

    if (!nationalId) {
      return res.status(400).json({
        success: false,
        error: 'National ID is required'
      });
    }

    // Mock OTP sending
    res.json({
      success: true,
      message: 'OTP sent successfully to your registered mobile number',
      nationalId,
      // In development, we can include the OTP for testing
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