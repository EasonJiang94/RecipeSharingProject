// models/Recipe.js
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
    category: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'dessert'],  // 限制分类只能是这四个值
    default: 'dinner'
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
