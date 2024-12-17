// routes/profile.js
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const RecipeUser = require('../models/RecipeUser');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const { ensureAuthenticated } = require('../config/auth');

// Profile page route
router.get('/', ensureAuthenticated, async (req, res) => {
    console.log("Authenticated User ID:", req.user._id);
    try {
        const userId = req.user._id;

        // Find profile for user
        const profile = await Profile.findOne({ uid: userId });

        // Fetch recipes using RecipeUser model
        const recipeUserEntries = await RecipeUser.find({ uid: userId }).populate('rid');
        const recipes = recipeUserEntries.map(entry => entry.rid);
        console.log("User's Recipes:", recipes);

        // Related comments
        const comments = await Comment.find({ uid: userId })
            .sort({ created_time: -1 });

        // Related likes
        const likes = await Like.find({ uid: userId });

        res.render('profile', {
            profile: profile || {},
            recipes: recipes || [],
            comments: comments || [],
            likes: likes || []
        });
    } catch (error) {
        console.error('Error loading profile:', error);
        res.status(500).send('Error loading profile');
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