// config/auth.js
module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', '请先登录');
    res.redirect('/users/login');
  },
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 1) {
      return next();
    }
    req.flash('error_msg', '无权限访问');
    res.redirect('/');
  }
};
