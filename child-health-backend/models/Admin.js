const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
  },
});

module.exports = mongoose.model('Admin', adminSchema);