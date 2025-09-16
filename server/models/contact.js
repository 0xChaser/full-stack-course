const mongoose = require('mongoose');

const Contact = new mongoose.Schema({
  email: { 
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Contact', Contact);