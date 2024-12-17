// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { ensureAuthenticated } = require('../config/auth');


router.post('/:recipeId', ensureAuthenticated, async (req, res) => {
  try {
    const { content } = req.body;
    const rid = req.params.recipeId;
    const uid = req.user._id;

    const newComment = new Comment({
      rid,
      uid,
      content
    });

    await newComment.save();

    res.json({ 
      success: true, 
      comment: {
        ...newComment.toObject(),
        user: {
          first_name: req.user.first_name,
          last_name: req.user.last_name
        }
      }
    });
  } catch (error) {
    res.json({ success: false, message: 'Error adding comment' });
  }
});


router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const comment = await Comment.findOne({ 
      _id: req.params.id,
      uid: req.user._id
    });

    if (!comment) {
      return res.json({ success: false, message: 'Comment not found or unauthorized' });
    }

    await comment.delete();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: 'Error deleting comment' });
  }
});

module.exports = router;