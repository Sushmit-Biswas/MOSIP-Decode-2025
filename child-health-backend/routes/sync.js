const express = require('express');
const router = express.Router();

// POST /api/sync/upload - Upload multiple child records
router.post('/upload', async (req, res) => {
  try {
    const { records, token } = req.body;

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: 'Records array is required'
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token is required'
      });
    }

    // Mock token validation
    if (!token.startsWith('mock_jwt_token_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful upload
    const uploadResults = records.map(record => ({
      localId: record.id,
      healthId: record.healthId,
      status: 'uploaded',
      timestamp: new Date().toISOString()
    }));

    res.json({
      success: true,
      data: {
        uploadedCount: records.length,
        results: uploadResults
      },
      message: `Successfully uploaded ${records.length} child records`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});

// GET /api/sync/status - Check sync status
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        serverTime: new Date().toISOString(),
        status: 'online',
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get sync status',
      message: error.message
    });
  }
});

module.exports = router;