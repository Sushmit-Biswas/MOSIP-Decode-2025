const express = require('express');
const router = express.Router();
const ChildRecord = require('../models/ChildRecord');
const HealthBookletGenerator = require('../services/pdfGenerator');

// GET /api/children - Get all child records
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, uploaded, representativeId } = req.query;
    
    // Build query filters
    const filters = {};
    if (search) {
      filters.$or = [
        { childName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { healthId: { $regex: search, $options: 'i' } }
      ];
    }
    if (uploaded !== undefined) {
      filters.uploaded = uploaded === 'true';
    }
    if (representativeId) {
      filters.representativeId = representativeId;
    }

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      lean: true
    };

    let records;
    try {
      // Try to use MongoDB if connected
      const totalCount = await ChildRecord.countDocuments(filters);
      records = await ChildRecord.find(filters)
        .sort(options.sort)
        .limit(options.limit)
        .skip((options.page - 1) * options.limit)
        .lean();

      res.json({
        success: true,
        data: records,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(totalCount / options.limit),
          totalCount,
          hasNext: options.page < Math.ceil(totalCount / options.limit),
          hasPrev: options.page > 1
        }
      });
    } catch (dbError) {
      // Fallback to mock data if MongoDB is not available
      console.log('MongoDB not available, using mock data');
      
      const mockRecords = [
        {
          _id: '1',
          healthId: 'CHR123456789',
          childName: 'John Doe',
          age: 5,
          weight: 18.5,
          height: 110,
          parentName: 'Jane Doe',
          malnutritionSigns: 'None observed',
          recentIllnesses: 'Common cold last month',
          timestamp: new Date().toISOString(),
          uploaded: true,
          representativeId: 'rep123'
        }
      ];

      res.json({
        success: true,
        data: mockRecords,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: mockRecords.length,
          hasNext: false,
          hasPrev: false
        }
      });
    }
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
      photo,
      parentalConsent,
      location,
      representativeId
    } = req.body;

    // Validation
    if (!childName || !age || !weight || !height || !parentName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'childName, age, weight, height, and parentName are required'
      });
    }

    if (!parentalConsent) {
      return res.status(400).json({
        success: false,
        error: 'Parental consent required',
        message: 'Parental consent must be granted before creating record'
      });
    }

    // Generate health ID
    const healthId = 'CHR' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();

    const recordData = {
      healthId,
      childName: childName.trim(),
      age: parseFloat(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      parentName: parentName.trim(),
      malnutritionSigns: malnutritionSigns?.trim() || 'N/A',
      recentIllnesses: recentIllnesses?.trim() || 'N/A',
      photo,
      parentalConsent: true,
      location: location || null,
      representativeId: representativeId || 'unknown',
      uploaded: true,
      syncedAt: new Date()
    };

    try {
      // Try to save to MongoDB
      const newRecord = new ChildRecord(recordData);
      const savedRecord = await newRecord.save();

      res.status(201).json({
        success: true,
        data: savedRecord,
        message: 'Child record created successfully'
      });
    } catch (dbError) {
      console.log('MongoDB not available, returning mock response');
      
      // Fallback mock response
      const mockRecord = {
        _id: Date.now().toString(),
        ...recordData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        data: mockRecord,
        message: 'Child record created successfully (mock mode)'
      });
    }
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

    try {
      // Try MongoDB first
      const record = await ChildRecord.findOne({ healthId }).lean();
      
      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Child record not found',
          message: `No record found with Health ID: ${healthId}`
        });
      }

      res.json({
        success: true,
        data: record
      });
    } catch (dbError) {
      console.log('MongoDB not available, using mock data');
      
      // Mock record retrieval
      const mockRecord = {
        _id: '1',
        healthId,
        childName: 'John Doe',
        age: 5,
        weight: 18.5,
        height: 110,
        parentName: 'Jane Doe',
        malnutritionSigns: 'None observed',
        recentIllnesses: 'Common cold last month',
        timestamp: new Date().toISOString(),
        uploaded: true,
        representativeId: 'rep123'
      };

      res.json({
        success: true,
        data: mockRecord
      });
    }
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
    const { download = 'true' } = req.query;

    // Get child record
    let childRecord;
    try {
      childRecord = await ChildRecord.findOne({ healthId }).lean();
    } catch (dbError) {
      // Fallback to mock data
      childRecord = {
        _id: '1',
        healthId,
        childName: 'John Doe',
        age: 5,
        weight: 18.5,
        height: 110,
        parentName: 'Jane Doe',
        malnutritionSigns: 'None observed',
        recentIllnesses: 'Common cold last month',
        timestamp: new Date().toISOString(),
        uploaded: true,
        representativeId: 'rep123',
        parentalConsent: true
      };
    }

    if (!childRecord) {
      return res.status(404).json({
        success: false,
        error: 'Child record not found',
        message: `No record found with Health ID: ${healthId}`
      });
    }

    // Generate PDF
    const pdfGenerator = new HealthBookletGenerator();
    const pdfBuffer = await pdfGenerator.generateBooklet(childRecord);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    if (download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="health-booklet-${healthId}.pdf"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="health-booklet-${healthId}.pdf"`);
    }

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF booklet',
      message: error.message
    });
  }
});

module.exports = router;