// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'account' }, async (account, password, done) => {
      try {
        // 查找用户 (Find user)
        const user = await User.findOne({ account: account });
        if (!user) {
          return done(null, false, { message: "User Account does not exit" }); // Account does not exist
        }

        // 验证密码 (Verify password)
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Wrong Password' }); // Incorrect password
        }
      } catch (err) {
        console.error(err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
