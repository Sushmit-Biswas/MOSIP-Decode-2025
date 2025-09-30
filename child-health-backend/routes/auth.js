const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Representative = require('../models/Representative');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Utility function to generate JWT token
const generateToken = (id, nationalId, role) => {
  return jwt.sign({ id, nationalId, role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new field representative
// @access  Public
router.post('/register', async (req, res) => {
  const { nationalId, password, name, contact } = req.body;

  try {
    // Check if representative already exists
    let representative = await Representative.findOne({ nationalId });
    if (representative) {
      return res.status(400).json({ message: 'Representative already exists' });
    }

    // Create new representative
    representative = new Representative({
      nationalId,
      password,
      name,
      contact,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    representative.password = await bcrypt.hash(password, salt);

    await representative.save();

    const token = generateToken(representative._id, representative.nationalId, 'field_representative');
    res.status(201).json({ message: 'Representative registered successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login/representative
// @desc    Authenticate field representative & get token
// @access  Public
router.post('/login/representative', async (req, res) => {
  const { nationalId, otp } = req.body;

  // For development, use a mock OTP system
  if (process.env.NODE_ENV === 'development') {
    if (otp !== '123456' && otp !== '000000') { // Allow 000000 as well for mock
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  }

  try {
    const representative = await Representative.findOne({ nationalId });
    if (!representative) {
      return res.status(400).json({ message: 'Invalid National ID' });
    }

    // In a real application, you would verify the OTP here
    // For this challenge, we're simulating with a hardcoded OTP in development

    const token = generateToken(representative._id, representative.nationalId, 'field_representative');
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: representative._id,
        nationalId: representative.nationalId,
        name: representative.name,
        role: 'field_representative',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login/admin
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login/admin', async (req, res) => {
  const { nationalId, password } = req.body;

  try {
    const admin = await Admin.findOne({ nationalId });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = generateToken(admin._id, admin.nationalId, 'admin');
    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        nationalId: admin.nationalId,
        name: admin.name,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user details
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: req.user._id,
      nationalId: req.user.nationalId,
      name: req.user.name,
      role: req.user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;