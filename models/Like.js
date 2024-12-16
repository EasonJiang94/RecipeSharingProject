// models/Like.js
const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  rid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
});

module.exports = mongoose.model('Like', LikeSchema);
