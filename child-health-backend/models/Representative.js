const mongoose = require('mongoose');

const representativeSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['field_agent', 'supervisor', 'admin'],
    default: 'field_agent'
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  assignedRegion: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  authTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }]
}, {
  timestamps: true
});

// Index for searching
representativeSchema.index({ name: 'text', assignedRegion: 'text' });
representativeSchema.index({ isActive: 1, role: 1 });

module.exports = mongoose.model('Representative', representativeSchema);