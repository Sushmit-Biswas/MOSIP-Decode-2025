const express = require('express');
const router = express.Router();
const ChildRecord = require('../models/ChildRecord');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/children/batch
// @desc    Upload multiple child records from a client's IndexedDB. This is the primary sync route.
// @access  Private (Field Representative)
router.post('/batch', protect, authorize('field_representative'), async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'No records provided for batch upload.' });
  }

  const results = {
    successfulUploads: [],
    failedUploads: []
  };

  // Use Promise.all to process all records concurrently for better performance
  await Promise.all(records.map(async (clientRecord) => {
    try {
      // Find a record by its unique healthId. If it exists, update it. If not, create it.
      // This makes the sync operation idempotent (safe to retry).
      const query = { healthId: clientRecord.healthId };
      const update = {
        ...clientRecord, // Use all data from the client
        representativeId: req.user.id, // CRITICAL: Enforce the uploader's ID for security
        uploaded: true, // Mark as successfully uploaded
        _id: undefined, // Ensure _id is not overwritten from client
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      const savedRecord = await ChildRecord.findOneAndUpdate(query, update, options);
      
      // Send back the original client-side ID so the client can update its local DB
      results.successfulUploads.push({
        id: clientRecord.id, // The temporary ID from the client's IndexedDB
        healthId: savedRecord.healthId,
        _id: savedRecord._id // The permanent ID from MongoDB
      });

    } catch (error) {
      // If any record fails, log the detailed error on the server and add it to the failed list.
      console.error(`Error processing record with healthId ${clientRecord.healthId}:`, error);
      results.failedUploads.push({
        id: clientRecord.id, // The client's ID
        healthId: clientRecord.healthId,
        error: error.message
      });
    }
  }));

  // Send a 200 OK status with the results. The client will use this to update its local state.
  res.status(200).json(results);
});

// @route   GET /api/children
// @desc    Get all child records (FOR ADMINS ONLY from MongoDB)
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const records = await ChildRecord.find({}).sort({ timestamp: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching child records for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/children/stats
// @desc    Get statistics about child records from MongoDB (FOR ADMINS ONLY)
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalRecords = await ChildRecord.countDocuments();
        res.json({ totalRecords });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;