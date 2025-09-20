const mongoose = require('mongoose');

const childRecordSchema = new mongoose.Schema({
  healthId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  childName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 18
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  height: {
    type: Number,
    required: true,
    min: 0
  },
  parentName: {
    type: String,
    required: true,
    trim: true
  },
  malnutritionSigns: {
    type: String,
    default: 'N/A'
  },
  recentIllnesses: {
    type: String,
    default: 'N/A'
  },
  photo: {
    type: String, // Base64 encoded image or file path
    default: null
  },
  parentalConsent: {
    type: Boolean,
    required: true,
    default: false
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    altitude: { type: Number, default: null },
    altitudeAccuracy: { type: Number, default: null },
    heading: { type: Number, default: null },
    speed: { type: Number, default: null },
    timestamp: { type: Number, default: null },
    formattedTime: { type: String, default: null },
    coordinateString: { type: String, default: null },
    accuracyCategory: { type: String, default: null },
    isFromCache: { type: Boolean, default: false },
    address: { type: String, default: null }
  },
  representativeId: {
    type: String,
    required: true
  },
  uploaded: {
    type: Boolean,
    default: true // True for server records, false for synced offline records
  },
  syncedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for BMI calculation
childRecordSchema.virtual('bmi').get(function() {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  return null;
});

// Index for searching
childRecordSchema.index({ childName: 'text', parentName: 'text' });
childRecordSchema.index({ createdAt: -1 });
childRecordSchema.index({ representativeId: 1, createdAt: -1 });

module.exports = mongoose.model('ChildRecord', childRecordSchema);