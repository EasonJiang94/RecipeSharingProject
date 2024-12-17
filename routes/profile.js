// routes/profile.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const RecipeUser = require('../models/RecipeUser');
const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');
const Like = require('../models/Like');
const { ensureAuthenticated } = require('../config/auth');

// Profile page route
router.get('/', async (req, res) => {
  try {
    // Find user profile
    const profile = await Profile.findOne({ uid: req.session.userId });
    
    // Find user's recipes
    const recipes = await Recipe.find({ uid: req.session.userId });
    
    // Get user's comments with populated recipe information
    const comments = await Comment.find({ uid: req.session.userId })
      .populate({
        path: 'rid',
        select: 'description category',  /
        model: 'Recipe'
      })
      .sort({ created_time: -1 });

    // Transform comments to match template expectations
    const transformedComments = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      created_time: comment.created_time,
      recipe: {
        title: comment.rid ? comment.rid.description : 'Deleted Recipe',
        category: comment.rid ? comment.rid.category : ''
      }
    }));

    res.render('profile', {
      profile: profile || {},
      recipes: recipes || [],
      comments: transformedComments || [],
    });
  } catch (error) {
    console.error('Error:', error);
    res.render('profile', { 
      profile: {},
      recipes: [],
      comments: [],
    });
  }
});

// Update profile information
router.post('/update', ensureAuthenticated, async (req, res) => {
    try {
        const { first_name, last_name, introduction } = req.body;
        const userId = req.user._id;

        await Profile.findOneAndUpdate(
            { uid: userId },
            {
                $set: {
                    first_name,
                    last_name,
                    introduction,
                    updated_at: new Date()
                }
            },
            { upsert: true }
        );

        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Error updating profile');
    }
});

// Update profile photo
router.post('/update-photo', ensureAuthenticated, async (req, res) => {
    try {
        const { photo } = req.body;
        const userId = req.user._id;

        await Profile.findOneAndUpdate(
            { uid: userId },
            {
                $set: {
                    photo,
                    updated_at: new Date()
                }
            },
            { upsert: true }
        );

        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).send('Error updating photo');
    }
});

// Delete recipe
router.post('/delete-recipe/:id', ensureAuthenticated, async (req, res) => {
    try {
        await Recipe.deleteOne({
            _id: req.params.id,
            uid: req.user._id
        });

        res.redirect('/profile');
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).send('Error deleting recipe');
    }
});

// Delete comment
router.post('/delete-comment/:id', ensureAuthenticated, async (req, res) => {
    try {
        await Comment.deleteOne({
            _id: req.params.id,
            uid: req.user._id
        });

        res.redirect('/profile');
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Error deleting comment');
    }
});

module.exports = router;