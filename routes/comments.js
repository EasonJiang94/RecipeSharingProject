// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
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

    const content = req.body.content;
    const rid = req.params.recipeId;
    const uid = req.user._id;

    const newComment = new Comment({
      rid,
      uid,
      content,
      created_time: new Date()
    });

    await newComment.save();

    res.json({
      success: true,
      comment: {
        _id: newComment._id,
        content: newComment.content,
        created_time: newComment.created_time,
        user: {
          first_name: req.user.first_name,
          last_name: req.user.last_name
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