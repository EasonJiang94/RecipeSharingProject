// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Base64 encoded image
  },
  introduction: {
    type: String,
  },
});

module.exports = mongoose.model('Profile', ProfileSchema);
