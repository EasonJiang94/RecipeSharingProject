// routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const RecipeUser = require('../models/RecipeUser');
const Like = require('../models/Like'); // Import Like model
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer'); // Import Multer
const path = require('path');

// Configure Multer storage to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add recipe page - must be before search by id and category
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_recipe', {
    errors: [],
    recipe: {
      description: '',
      ingredient: '',
      instruction: '',
      category: ''
    }
  });
});

// Add recipe handling with Multer middleware
router.post('/add', ensureAuthenticated, upload.single('photo'), async (req, res) => {
  console.log("request body : ", req.body);
  console.log("request file : ", req.file); // Log the file for debugging
  const { description, ingredient, instruction, category } = req.body;
  let errors = [];

  if (!description || !ingredient || !instruction || !category) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (errors.length > 0) {
    return res.render('add_recipe', {
      errors,
      recipe: {
        description,
        ingredient,
        instruction,
        category
      }
    });
  }

  try {
    const newRecipe = new Recipe({
      description,
      ingredient: ingredient.split(',').map(item => item.trim()),
      instruction,
      category,
      photo: req.file ? req.file.buffer.toString('base64') : null,
      likes: 0 
    });
    
    const savedRecipe = await newRecipe.save();

    // Create recipe-user relationship
    const recipeUser = new RecipeUser({
      rid: savedRecipe._id,
      uid: req.user._id
    });
    await recipeUser.save();

    req.flash('success_msg', 'Recipe added successfully');
    res.redirect('/');
  } catch (err) {
    console.error('Error adding recipe:', err);
    return res.render('add_recipe', {
      errors: [{ msg: 'Error adding recipe. Please try again.' }],
      recipe: {
        description,
        ingredient,
        instruction,
        category
      }
    });
  }
});

// Like recipe handling
router.post('/like/:id', ensureAuthenticated, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    // Check if already liked
    const existingLike = await Like.findOne({ rid: recipeId, uid: userId });
    if (existingLike) {
      return res.status(400).json({ success: false, message: 'You already liked this recipe.' });
    }

    // Insert new like record
    await new Like({ rid: recipeId, uid: userId }).save();

    // Recalculate like count
    const likeCount = await Like.countDocuments({ rid: recipeId });

    res.json({ success: true, likes: likeCount });
  } catch (err) {
    console.error('Error while liking recipe:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// View single recipe - must be after /add route
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      req.flash('error', 'Recipe not found');
      return res.redirect('/');
    }

    // Count likes
    const likeCount = await Like.countDocuments({ rid: recipe._id });

    const recipeUser = await RecipeUser.findOne({ rid: recipe._id }).populate('uid');

    res.render('recipe', { 
      recipe: { ...recipe._doc, likes: likeCount }, // Pass like count to frontend
      creator: recipeUser ? recipeUser.uid : null 
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading recipe');
    res.redirect('/');
  }
});

module.exports = router;
