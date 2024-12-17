// routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { ensureAuthenticated } = require('../config/auth');

// Add new recipe page
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_recipe');
});

// Add new recipe handling
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { description, ingredient, instruction, category } = req.body;
  let errors = [];

  // Validation
  if (!description || !ingredient || !instruction || !category) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (errors.length > 0) {
    res.render('add_recipe', {
      errors,
      description,
      ingredient,
      instruction,
      category
    });
  } else {
    try {
      const newRecipe = new Recipe({
        description,
        ingredient: ingredient.split(',').map(item => item.trim()),
        instruction,
        category,
        uid: req.user._id // Add user reference
      });

      if (req.file) {
        newRecipe.photo = req.file.buffer.toString('base64');
      }

      await newRecipe.save();
      req.flash('success_msg', 'Recipe added successfully');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.render('add_recipe', {
        errors: [{ msg: 'An error occurred while adding the recipe' }],
        description,
        ingredient,
        instruction,
        category
      });
    }
  }
});

// View single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('uid', 'username');
    if (!recipe) {
      req.flash('error_msg', 'Recipe not found');
      return res.redirect('/');
    }
    res.render('recipe', { recipe });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading recipe');
    res.redirect('/');
  }
});

module.exports = router;