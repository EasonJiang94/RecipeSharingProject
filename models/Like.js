const mongoose = require('mongoose');

// Like model - stores likes for both recipes and comments
const LikeSchema = new mongoose.Schema({
  rid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }
});

// Ensure a like must be associated with either a recipe or a comment, but not both
LikeSchema.pre('save', function(next) {
  if ((this.rid && this.cid) || (!this.rid && !this.cid)) {
    next(new Error('A like must be associated with either a recipe or a comment, but not both'));
  }
  next();
});

// Create unique indexes to prevent duplicate likes
LikeSchema.index({ rid: 1, uid: 1 }, { unique: true, sparse: true });
LikeSchema.index({ cid: 1, uid: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Like', LikeSchema);