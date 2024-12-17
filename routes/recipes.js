// routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const RecipeUser = require('../models/RecipeUser');
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

// View single recipe - 必须放在 /add 路由之后
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      req.flash('error', 'Recipe not found');
      return res.redirect('/');
    }

    const recipeUser = await RecipeUser.findOne({ rid: recipe._id }).populate('uid');

    res.render('recipe', { 
      recipe,
      creator: recipeUser ? recipeUser.uid : null 
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading recipe');
    res.redirect('/');
  }
});

module.exports = router;