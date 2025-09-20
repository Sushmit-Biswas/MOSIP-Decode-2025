const express = require('express');
const router = express.Router();

// GET /api/children - Get all child records
router.get('/', async (req, res) => {
  try {
    // Mock data for now - will connect to MongoDB later
    const mockRecords = [
      {
        id: 1,
        healthId: 'CHR123456789',
        childName: 'John Doe',
        age: 5,
        weight: 18.5,
        height: 110,
        parentName: 'Jane Doe',
        malnutritionSigns: 'None observed',
        recentIllnesses: 'Common cold last month',
        timestamp: new Date().toISOString(),
        uploaded: true
      }
    ];

    res.json({
      success: true,
      data: mockRecords,
      count: mockRecords.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch child records',
      message: error.message
    });
  }
});

// POST /api/children - Create new child record
router.post('/', async (req, res) => {
  try {
    const {
      childName,
      age,
      weight,
      height,
      parentName,
      malnutritionSigns,
      recentIllnesses,
      photo
    } = req.body;

    // Generate health ID
    const healthId = 'CHR' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    // Mock record creation - will save to MongoDB later
    const newRecord = {
      id: Date.now(),
      healthId,
      childName,
      age,
      weight,
      height,
      parentName,
      malnutritionSigns: malnutritionSigns || 'N/A',
      recentIllnesses: recentIllnesses || 'N/A',
      photo,
      timestamp: new Date().toISOString(),
      uploaded: true
    };

    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Child record created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create child record',
      message: error.message
    });
  }
});

// GET /api/children/:healthId - Get child record by health ID
router.get('/:healthId', async (req, res) => {
  try {
    const { healthId } = req.params;

    // Mock record retrieval - will query MongoDB later
    const mockRecord = {
      id: 1,
      healthId,
      childName: 'John Doe',
      age: 5,
      weight: 18.5,
      height: 110,
      parentName: 'Jane Doe',
      malnutritionSigns: 'None observed',
      recentIllnesses: 'Common cold last month',
      timestamp: new Date().toISOString(),
      uploaded: true
    };

    res.json({
      success: true,
      data: mockRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch child record',
      message: error.message
    });
  }
});

// GET /api/children/:healthId/booklet - Generate PDF booklet
router.get('/:healthId/booklet', async (req, res) => {
  try {
    const { healthId } = req.params;

    // Mock PDF generation - will implement actual PDF generation later
    res.json({
      success: true,
      message: 'PDF booklet generation endpoint',
      healthId,
      downloadUrl: `/api/children/${healthId}/booklet.pdf`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF booklet',
      message: error.message
    });
  }
});

module.exports = router;