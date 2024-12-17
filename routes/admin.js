// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { ensureAdmin } = require('../config/auth');

// GET Admin Dashboard - List all users
router.get('/', ensureAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        req.flash('error_msg', 'Error fetching users.');
        res.redirect('/');
    }
});

// POST Delete User
router.post('/delete/:id', ensureAdmin, async (req, res) => {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
        req.flash('error_msg', 'You cannot delete your own account.');
        return res.redirect('/admin');
    }

    try {
        // Delete user profile first if exists
        await Profile.deleteOne({ uid: userId });

        // Then delete the user
        await User.deleteOne({ _id: userId });

        req.flash('success_msg', 'User deleted successfully.');
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error_msg', 'Error deleting user.');
        res.redirect('/admin');
    }
});

// POST Reset User Password
router.post('/reset-password/:id', ensureAdmin, async (req, res) => {
    const userId = req.params.id;
    const { newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
        req.flash('error_msg', 'Password must be at least 6 characters long.');
        return res.redirect('/admin');
    }

    try {
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        req.flash('success_msg', 'User password reset successfully.');
        res.redirect('/admin');
    } catch (error) {
        console.error('Error resetting password:', error);
        req.flash('error_msg', 'Error resetting password.');
        res.redirect('/admin');
    }
});

module.exports = router;
