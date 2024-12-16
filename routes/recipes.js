// routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { ensureAuthenticated } = require('../config/auth');

// 添加新食谱页面
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_recipe');
});

// 添加新食谱处理
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { description, ingredient, instruction } = req.body;
  let errors = [];

  if (!description || !ingredient || !instruction) {
    errors.push({ msg: '请填写所有字段' });
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
        // photo: 处理上传的图片
      });
      await newRecipe.save();
      req.flash('success_msg', '食谱添加成功');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.render('add_recipe', {
        errors: [{ msg: '添加食谱过程中发生错误' }],
        description,
        ingredient,
        instruction,
      });
    }
  }
});

// 查看单个食谱
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    // 你可以在这里填充评论、点赞等信息
    res.render('recipe', { recipe });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
