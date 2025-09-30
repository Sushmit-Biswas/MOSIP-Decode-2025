const mongoose = require('mongoose');

const childRecordSchema = new mongoose.Schema({
  healthId: {
    type: String,
    required: true,
    unique: true,
  },
  childName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 18,
  },
  weight: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  bmi: {
    type: String,
  },
  parentName: {
    type: String,
    required: true,
  },
  malnutritionSigns: {
    type: String,
  },
  recentIllnesses: {
    type: String,
  },
  childId: {
    type: String, // This could be an external ID like Aadhar, if applicable
  },
  parentalConsent: {
    type: Boolean,
    required: true,
  },
  photo: {
    type: String, // Base64 encoded image
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date,
    coordinateString: String,
  },
  representativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Representative',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  uploaded: {
    type: Boolean,
    default: false, // Indicates if the record has been uploaded to the central server
  },
});

module.exports = mongoose.model('ChildRecord', childRecordSchema);