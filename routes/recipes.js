// routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const RecipeUser = require('../models/RecipeUser');
const Comment = require('../models/Comment');
const Like = require('../models/Like'); // Import Like model
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer'); // Import Multer
const path = require('path');

// Configure Multer storage to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

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

    // Check if the user has already liked the recipe
    const existingLike = await Like.findOne({ rid: recipeId, uid: userId });
    if (existingLike) {
      return res.status(400).json({ success: false, message: 'You already liked this recipe.' });
    }

    // Insert new like record
    await new Like({ rid: recipeId, uid: userId }).save();

    // Increment the likes count in the Recipe model
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json({ success: true, likes: updatedRecipe.likes });
  } catch (err) {
    console.error('Error while liking recipe:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// View single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      req.flash('error', 'Recipe not found');
      return res.redirect('/');
    }

        // Get comments for this recipe
    const comments = await Comment.find({ rid: recipe._id })
      .populate('uid', 'first_name last_name')
      .sort({ created_time: -1 })
      .lean(); 
    // Count likes
    const likeCount = await Like.countDocuments({ rid: recipe._id });

    // Find the user who created the recipe
    const recipeUser = await RecipeUser.findOne({ rid: recipe._id }).populate('uid');
    

    // Determine if the current user has liked this recipe
    let hasLiked = false;
    if (req.user) {
      const existingLike = await Like.findOne({ rid: recipe._id, uid: req.user._id });
      if (existingLike) {
        hasLiked = true;
      }
    }

    // Set currentCategory to the recipe's category or default to 'all'
    const currentCategory = recipe.category || 'all';

    res.render('recipe', { 
      recipe: { ...recipe._doc, likes: likeCount }, 
      creator: recipeUser ? recipeUser.uid : null,
      currentCategory,
      hasLiked,
      comments: comments || [],
      user: req.user || null 
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading recipe');
    res.redirect('/');
  }
});

// Unlike recipe handling
router.post('/unlike/:id', ensureAuthenticated, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    // Find the existing like
    const existingLike = await Like.findOne({ rid: recipeId, uid: userId });
    if (!existingLike) {
      return res.status(400).json({ success: false, message: 'You have not liked this recipe.' });
    }

    // Remove the Like document
    await Like.findByIdAndDelete(existingLike._id);

    // Decrement the likes count in the Recipe model
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $inc: { likes: -1 } },
      { new: true }
    );

    res.json({ success: true, likes: updatedRecipe.likes });
  } catch (err) {
    console.error('Error while unliking recipe:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
