const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  ingredient: {
    type: [String],
    required: true,
  },
  instruction: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Base64 encoded image
  },
  likes: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recipe', RecipeSchema);
