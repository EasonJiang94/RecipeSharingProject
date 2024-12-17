// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register handling
router.post('/register', async (req, res) => {
  const { account, password, password2, first_name, last_name } = req.body;
  let errors = [];

  // Check required fields
  if (!account || !password || !password2 || !first_name || !last_name) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check if passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
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
        errors.push({ msg: 'Account already exists' });
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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        // Create user profile
        const newProfile = new Profile({
          uid: newUser._id,
          first_name,
          last_name,
        });
        await newProfile.save();

        req.flash('success_msg', 'Registration successful, please log in');
        res.redirect('/users/login');
      }
    } catch (err) {
      console.error(err);
      res.render('register', {
        errors: [{ msg: 'An error occurred during registration' }],
        account,
        password,
        password2,
        first_name,
        last_name,
      });
    }
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Login handling
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You have logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;
