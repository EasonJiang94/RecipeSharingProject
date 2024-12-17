// routes/index.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Profile = require('../models/Profile');

// main page
router.get('/', async (req, res) => {
  try {
    const dailyRecipe = await Recipe.aggregate([{ $sample: { size: 1 } }]);
    const hotRecipes = await Recipe.find().sort({ likes: -1 }).limit(3);
    // get user list
    const users = await User.find().limit(3);
    // get user profile
    const profiles = await Profile.find({
      uid: { $in: users.map(user => user._id) }
    });

    // combine search
    const topCooks = users.map(user => {
      const profile = profiles.find(p => p.uid.toString() === user._id.toString());
      return {
        ...user.toObject(),
        profile: profile || {}
      };
    });

    res.render('index', {
      dailyRecipe: dailyRecipe[0] || null,
      hotRecipes: hotRecipes || [],
      topCooks: topCooks || [],
    });
  } catch (err) {
    console.error(err);
    res.render('index', { dailyRecipe: null, hotRecipes: [], topCooks: [] });
  }
});

// search result page
router.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const recipes = await Recipe.find({ description: { $regex: query, $options: 'i' } });
    res.render('search', { recipes, query });
  } catch (err) {
    console.error(err);
    res.render('search', { recipes: [], query });
  }
});

module.exports = router;
