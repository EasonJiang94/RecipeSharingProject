// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { ensureAdmin } = require('../config/auth');

// 管理员首页
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find().populate('profile');
    res.render('admin', { users });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// 删除用户
router.post('/delete/:id', ensureAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', '用户已删除');
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', '删除用户时发生错误');
    res.redirect('/admin');
  }
});

// 重置用户密码
router.post('/reset-password/:id', ensureAdmin, async (req, res) => {
  const { newPassword } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      req.flash('success_msg', '密码已重置');
    }
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', '重置密码时发生错误');
    res.redirect('/admin');
  }
});

module.exports = router;
