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
  const { description, ingredient, instruction } = req.body;
  let errors = [];

  if (!description || !ingredient || !instruction) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (errors.length > 0) {
    res.render('add_recipe', {
      errors,
      description,
      ingredient,
      instruction,
    });
  } else {
    try {
      const newRecipe = new Recipe({
        description,
        ingredient: ingredient.split(',').map(item => item.trim()),
        instruction,
        // photo: handle image upload
      });
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
      });
    }
  }
});

// View single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    // You can populate comments, likes, etc., here
    res.render('recipe', { recipe });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
