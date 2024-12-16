// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const Profile = require('../models/Profile');

// 注册页面
router.get('/register', (req, res) => {
  res.render('register');
});

// 注册处理
router.post('/register', async (req, res) => {
  const { account, password, password2, first_name, last_name } = req.body;
  let errors = [];

  // 检查必填字段
  if (!account || !password || !password2 || !first_name || !last_name) {
    errors.push({ msg: '请填写所有字段' });
  }

  // 检查密码是否匹配
  if (password !== password2) {
    errors.push({ msg: '密码不匹配' });
  }

  // 检查密码长度
  if (password.length < 6) {
    errors.push({ msg: '密码长度至少为 6 个字符' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      account,
      password,
      password2,
      first_name,
      last_name,
    });
  } else {
    try {
      const existingUser = await User.findOne({ account: account });
      if (existingUser) {
        errors.push({ msg: '账户已存在' });
        res.render('register', {
          errors,
          account,
          password,
          password2,
          first_name,
          last_name,
        });
      } else {
        const newUser = new User({
          account,
          password,
        });

        // 哈希密码
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        // 创建用户个人资料
        const newProfile = new Profile({
          uid: newUser._id,
          first_name,
          last_name,
        });
        await newProfile.save();

        req.flash('success_msg', '注册成功，请登录');
        res.redirect('/users/login');
      }
    } catch (err) {
      console.error(err);
      res.render('register', {
        errors: [{ msg: '注册过程中发生错误' }],
        account,
        password,
        password2,
        first_name,
        last_name,
      });
    }
  }
});

// 登录页面
router.get('/login', (req, res) => {
  res.render('login');
});

// 登录处理
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// 登出
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', '你已登出');
    res.redirect('/users/login');
  });
});

module.exports = router;
