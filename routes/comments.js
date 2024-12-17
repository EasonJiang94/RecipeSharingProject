// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Recipe = require("../models/Recipe");
const Profile = require('../models/Profile');
const { ensureAuthenticated } = require('../config/auth');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Add comment to recipe
router.post('/:recipeId', ensureAuthenticated, async (req, res) => {
  try {
    console.log('Request body:', req.body); 

    if (!req.body || !req.body.content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Get user's profile first
    const userProfile = await Profile.findOne({ uid: req.user._id });
    if (!userProfile) {
      return res.status(400).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const newComment = new Comment({
      rid: req.params.recipeId,
      uid: req.user._id,
      content: req.body.content,
      created_time: new Date()
    });

    await newComment.save();

    res.json({
      success: true,
      comment: {
        _id: newComment._id,
        content: newComment.content,
        created_time: newComment.created_time,
        authorName: `${userProfile.first_name} ${userProfile.last_name}`,
        user: {
          first_name: userProfile.first_name,
          last_name: userProfile.last_name
        }
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding comment',
      error: error.message 
    });
  }
});
// get comments
router.get('/:recipeId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ rid: req.params.recipeId })
      .populate({
        path: 'uid',
        model: 'Profile', // Make sure this matches your Profile model name
        select: 'first_name last_name'
      })
      .sort({ created_time: -1 });

    const formattedComments = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      created_time: comment.created_time,
      authorName: `${comment.uid.first_name} ${comment.uid.last_name}`,
      uid: comment.uid._id
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching comments' 
    });
  }
});

// Delete comment
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.id,
      uid: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found or unauthorized' 
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting comment' 
    });
  }
});

module.exports = router;