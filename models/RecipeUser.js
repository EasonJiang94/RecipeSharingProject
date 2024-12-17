const mongoose = require('mongoose');

// Recipe-User relationship model - connects recipes with their creators
const RecipeUserSchema = new mongoose.Schema({
  rid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Index for unique recipe-user combination
RecipeUserSchema.index({ rid: 1, uid: 1 }, { unique: true });

module.exports = mongoose.model('RecipeUser', RecipeUserSchema);