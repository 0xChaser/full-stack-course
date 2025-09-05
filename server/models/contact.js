const mongoose = require('mongoose');

const Contact = new mongoose.Schema({
  email: { 
    type: String,
    required: true
  },
  firstName: {
    type: String,
    require: true
  },
  lastName: {
    type: String,
    require: true
  },
  user_id: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', Contact);