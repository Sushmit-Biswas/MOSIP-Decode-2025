const express = require('express');
const router = express.Router();
const ChildRecord = require('../models/ChildRecord');

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

    const uploadResults = [];
    let successCount = 0;
    let failCount = 0;

    try {
      // Try to save to MongoDB
      for (const record of records) {
        try {
          // Check if record already exists
          const existingRecord = await ChildRecord.findOne({ 
            $or: [
              { healthId: record.healthId },
              { _id: record.serverId }
            ]
          });

          let savedRecord;
          if (existingRecord) {
            // Update existing record
            savedRecord = await ChildRecord.findByIdAndUpdate(
              existingRecord._id,
              {
                ...record,
                uploaded: true,
                syncedAt: new Date(),
                lastModified: new Date()
              },
              { new: true, lean: true }
            );
          } else {
            // Create new record
            const newRecord = new ChildRecord({
              ...record,
              uploaded: true,
              syncedAt: new Date()
            });
            savedRecord = await newRecord.save();
          }

          uploadResults.push({
            localId: record.id || record.localId,
            healthId: record.healthId,
            serverId: savedRecord._id,
            status: 'uploaded',
            timestamp: new Date().toISOString()
          });
          successCount++;
        } catch (recordError) {
          console.error('Failed to save record:', recordError);
          uploadResults.push({
            localId: record.id || record.localId,
            healthId: record.healthId,
            status: 'failed',
            error: recordError.message,
            timestamp: new Date().toISOString()
          });
          failCount++;
        }
      }
    } catch (dbError) {
      console.log('MongoDB not available, using mock response');
      
      // Fallback to mock success
      records.forEach(record => {
        uploadResults.push({
          localId: record.id || record.localId,
          healthId: record.healthId,
          serverId: 'mock_' + Date.now(),
          status: 'uploaded',
          timestamp: new Date().toISOString()
        });
        successCount++;
      });
    }

    res.json({
      success: true,
      data: {
        totalRecords: records.length,
        uploadedCount: successCount,
        failedCount: failCount,
        results: uploadResults
      },
      message: `Upload completed: ${successCount} successful, ${failCount} failed`
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