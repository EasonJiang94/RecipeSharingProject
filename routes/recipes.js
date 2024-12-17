const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const RecipeUser = require('../models/RecipeUser');
const Like = require('../models/Like'); // 引入 Like 模型
const { ensureAuthenticated } = require('../config/auth');

// Add recipe page - must before search by id and category
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

// Add recipe handling
router.post('/add', ensureAuthenticated, async (req, res) => {
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
      photo: req.file ? req.file.buffer.toString('base64') : null
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

// Like a recipe
router.post('/:id/like', ensureAuthenticated, async (req, res) => {
  const { id } = req.params; // Recipe ID
  const userId = req.user._id;

  try {
    // 检查用户是否已点赞
    const existingLike = await Like.findOne({ uid: userId, rid: id });

    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this recipe' });
    }

    // 保存点赞
    const newLike = new Like({ uid: userId, rid: id });
    await newLike.save();

    res.status(200).json({ message: 'Recipe liked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error liking recipe' });
  }
});

// Unlike a recipe
router.post('/:id/unlike', ensureAuthenticated, async (req, res) => {
  const { id } = req.params; // Recipe ID
  const userId = req.user._id;

  try {
    await Like.findOneAndDelete({ uid: userId, rid: id });
    res.status(200).json({ message: 'Recipe unliked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error unliking recipe' });
  }
});

// View single recipe - must be placed after /add route
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      req.flash('error', 'Recipe not found');
      return res.redirect('/');
    }

    const recipeUser = await RecipeUser.findOne({ rid: recipe._id }).populate('uid');
    const likeCount = await Like.countDocuments({ rid: recipe._id }); // 统计点赞数
    const userLiked = req.user 
      ? await Like.findOne({ uid: req.user._id, rid: recipe._id })
      : null;

    res.render('recipe', { 
      recipe,
      creator: recipeUser ? recipeUser.uid : null,
      likeCount,
      userLiked: !!userLiked // 用户是否点赞
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading recipe');
    res.redirect('/');
  }
});

module.exports = router;
