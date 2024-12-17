const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const RecipeUser = require('../models/RecipeUser');
const Like = require('../models/Like'); // 引入 Like 模型
const { ensureAuthenticated } = require('../config/auth');

// 你的其他路由代码

// Like a recipe
router.post('/:id/like', async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'Please log in first');
    return res.redirect(`/recipes/${req.params.id}`);
  }

  const { id } = req.params; // Recipe ID
  const userId = req.user._id;

  try {
    // 检查用户是否已点赞
    const existingLike = await Like.findOne({ uid: userId, rid: id });

    if (existingLike) {
      req.flash('error_msg', 'You have already liked this recipe');
      return res.redirect(`/recipes/${id}`);
    }

    // 保存点赞
    const newLike = new Like({ uid: userId, rid: id });
    await newLike.save();

    req.flash('success_msg', 'Recipe liked successfully');
    res.redirect(`/recipes/${id}`);
  } catch (err) {
    console.error('Error liking recipe:', err);
    req.flash('error_msg', 'Error liking recipe. Please try again.');
    res.redirect(`/recipes/${id}`);
  }
});

// Unlike a recipe
router.post('/:id/unlike', async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'Please log in first');
    return res.redirect(`/recipes/${req.params.id}`);
  }

  const { id } = req.params; // Recipe ID
  const userId = req.user._id;

  try {
    const like = await Like.findOne({ uid: userId, rid: id });
    if (!like) {
      req.flash('error_msg', 'You have not liked this recipe yet');
      return res.redirect(`/recipes/${id}`);
    }

    await Like.findByIdAndDelete(like._id);
    req.flash('success_msg', 'Recipe unliked successfully');
    res.redirect(`/recipes/${id}`);
  } catch (err) {
    console.error('Error unliking recipe:', err);
    req.flash('error_msg', 'Error unliking recipe. Please try again.');
    res.redirect(`/recipes/${id}`);
  }
});
