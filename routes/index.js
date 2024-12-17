const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Profile = require('../models/Profile');

// main page
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    
    if (category && category !== 'all') {
      // If category is selected, only get recipes of that category
      const recipes = await Recipe.find({ category }).sort({ likes: -1 });
      res.render('index', {
        showCategoryOnly: true,
        recipes: recipes || [],
        currentCategory: category
      });
    } else {
      // Show full homepage with all sections
      const dailyRecipe = await Recipe.aggregate([{ $sample: { size: 1 } }]);
      const hotRecipes = await Recipe.find().sort({ likes: -1 }).limit(3);
      const users = await User.find().limit(3);
      const profiles = await Profile.find({
        uid: { $in: users.map(user => user._id) }
      });

      const topCooks = users.map(user => {
        const profile = profiles.find(p => p.uid.toString() === user._id.toString());
        return {
          ...user.toObject(),
          profile: profile || {}
        };
      });

      res.render('index', {
        showCategoryOnly: false,
        dailyRecipe: dailyRecipe[0] || null,
        hotRecipes: hotRecipes || [],
        topCooks: topCooks || [],
        currentCategory: 'all'
      });
    }
  } catch (err) {
    console.error(err);
    res.render('index', { 
      showCategoryOnly: false,
      dailyRecipe: null, 
      hotRecipes: [], 
      topCooks: [],
      currentCategory: 'all'
    });
  }
});

// search result page
router.get('/search', async (req, res) => {
  const query = req.query.q;
  const category = req.query.category || 'all';

  try {
    let searchQuery = {
      description: { $regex: query, $options: 'i' }
    };

    if (category !== 'all') {
      searchQuery.category = category;
    }

    const recipes = await Recipe.find(searchQuery);
    res.render('search', { 
      recipes, 
      query,
      currentCategory: category 
    });
  } catch (err) {
    console.error(err);
    res.render('search', { 
      recipes: [], 
      query,
      currentCategory: 'all'
    });
  }
});

module.exports = router;
