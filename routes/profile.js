// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

// Profile page route
router.get('/', async (req, res) => {
    try {
        // find profile for user
        const profile = await Profile.findOne({ uid: req.session.userId });
        
        // related recipe
        const recipes = await Recipe.find({ uid: req.session.userId });
            
        // related comments
        const comments = await Comment.find({ uid: req.session.userId })
            .sort({ created_time: -1 });
            
        // related likes
        const likes = await Like.find({ uid: req.session.userId });

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
router.post('/update', async (req, res) => {
    try {
        const { first_name, last_name, introduction } = req.body;
        
        await Profile.findOneAndUpdate(
            { uid: req.session.userId },
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
router.post('/update-photo', async (req, res) => {
    try {
        const { photo } = req.body;

        await Profile.findOneAndUpdate(
            { uid: req.session.userId },
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
router.post('/delete-recipe/:id', async (req, res) => {
    try {
        await Recipe.deleteOne({
            _id: req.params.id,
            uid: req.session.userId
        });
        
        res.redirect('/profile');
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).send('Error deleting recipe');
    }
});

// Delete comment
router.post('/delete-comment/:id', async (req, res) => {
    try {
        await Comment.deleteOne({
            _id: req.params.id,
            uid: req.session.userId
        });
        
        res.redirect('/profile');
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Error deleting comment');
    }
});

module.exports = router;