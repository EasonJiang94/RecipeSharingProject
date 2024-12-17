// config/auth.js
module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in first');
    res.redirect('/users/login');
  },
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 1) {
      return next();
    }
    req.flash('error_msg', 'You do not have permission to access that page.');
    res.redirect('/');
  }
};
