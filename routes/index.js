// routes/index.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// 主页
router.get('/', async (req, res) => {
  try {
    const dailyRecipe = await Recipe.aggregate([{ $sample: { size: 1 } }]);
    const hotRecipes = await Recipe.find().sort({ likes: -1 }).limit(3);
    const topCooks = await User.find().populate('profile').sort({ /* 根据你定义的条件 */ }).limit(3);
    res.render('index', {
      dailyRecipe: dailyRecipe[0],
      hotRecipes: hotRecipes,
      topCooks: topCooks,
    });
  } catch (err) {
    console.error(err);
    res.render('index', { dailyRecipe: null, hotRecipes: [], topCooks: [] });
  }
});

// 搜索结果页面
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
