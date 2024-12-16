#!/bin/bash



# 初始化 npm 项目
npm init -y

# 安装依赖
npm install bcrypt body-parser connect-flash connect-mongo dotenv ejs express express-session mongoose passport passport-local

# 创建目录结构
mkdir -p views/partials
mkdir -p public/css
mkdir -p public/js
mkdir -p public/images
mkdir -p models
mkdir -p routes
mkdir -p config

# 创建 server.js
cat <<EOL > server.js
// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

// 初始化 Express
const app = express();

// 连接到 MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// 设置 EJS 作为模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'your_secret_key', // 请替换为你的密钥
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-app' }),
}));
app.use(flash());

// Passport 配置
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// 设置全局变量
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// 路由
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/recipes', require('./routes/recipes'));
app.use('/admin', require('./routes/admin'));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server started on port \${PORT}\`);
});
EOL

# 创建 package.json 脚本
cat <<EOL > package.json
{
  "name": "recipe-sharing-platform",
  "version": "1.0.0",
  "description": "A fully featured recipe sharing web application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "seed": "node seed.js"
  },
  "dependencies": {
    "bcrypt": "^5.0.1",
    "body-parser": "^1.19.0",
    "connect-flash": "^0.1.1",
    "connect-mongo": "^4.6.0",
    "dotenv": "^16.0.0",
    "ejs": "^3.1.6",
    "express": "^4.17.1",
    "express-session": "^1.17.2",
    "mongoose": "^6.0.12",
    "passport": "^0.4.1",
    "passport-local": "^1.0.0"
  }
}
EOL

# 创建 config/passport.js
cat <<EOL > config/passport.js
// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'account' }, (account, password, done) => {
      // 查找用户
      User.findOne({ account: account })
        .then(user => {
          if (!user) {
            return done(null, false, { message: '账户不存在' });
          }

          // 验证密码
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: '密码错误' });
            }
          });
        })
        .catch(err => console.error(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
EOL

# 创建 config/auth.js
cat <<EOL > config/auth.js
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
EOL

# 创建 models/User.js
cat <<EOL > models/User.js
// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  account: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number, // 1 for admin, 2 for regular user
    default: 2,
  },
});

module.exports = mongoose.model('User', UserSchema);
EOL

# 创建 models/Profile.js
cat <<EOL > models/Profile.js
// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Base64 encoded image
  },
  introduction: {
    type: String,
  },
});

module.exports = mongoose.model('Profile', ProfileSchema);
EOL

# 创建 models/Recipe.js
cat <<EOL > models/Recipe.js
// models/Recipe.js
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  ingredient: {
    type: [String],
    required: true,
  },
  instruction: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // Base64 encoded image
  },
  likes: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recipe', RecipeSchema);
EOL

# 创建 models/Comment.js
cat <<EOL > models/Comment.js
// models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  rid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', CommentSchema);
EOL

# 创建 models/Like.js
cat <<EOL > models/Like.js
// models/Like.js
const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  rid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  },
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
});

module.exports = mongoose.model('Like', LikeSchema);
EOL

# 创建 routes/index.js
cat <<EOL > routes/index.js
// routes/index.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// 主页
router.get('/', async (req, res) => {
  try {
    const dailyRecipe = await Recipe.aggregate([{ \$sample: { size: 1 } }]);
    const hotRecipes = await Recipe.find().sort({ likes: -1 }).limit(3);
    const topCooks = await User.find().populate('profile').sort({ /* 根据你定义的条件 */ }).limit(3);
    res.render('index', {
      dailyRecipe: dailyRecipe[0],
      hotRecipes: hotRecipes,
      topCooks: topCooks,
    });
  } catch (err) {
    console.error(err);
    res.render('index', { dailyRecipe: null, hotRecipes: [], topCooks: [] });
  }
});

// 搜索结果页面
router.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const recipes = await Recipe.find({ description: { \$regex: query, \$options: 'i' } });
    res.render('search', { recipes, query });
  } catch (err) {
    console.error(err);
    res.render('search', { recipes: [], query });
  }
});

module.exports = router;
EOL

# 创建 routes/users.js
cat <<EOL > routes/users.js
// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const Profile = require('../models/Profile');

// 注册页面
router.get('/register', (req, res) => {
  res.render('register');
});

// 注册处理
router.post('/register', async (req, res) => {
  const { account, password, password2, first_name, last_name } = req.body;
  let errors = [];

  // 检查必填字段
  if (!account || !password || !password2 || !first_name || !last_name) {
    errors.push({ msg: '请填写所有字段' });
  }

  // 检查密码是否匹配
  if (password !== password2) {
    errors.push({ msg: '密码不匹配' });
  }

  // 检查密码长度
  if (password.length < 6) {
    errors.push({ msg: '密码长度至少为 6 个字符' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      account,
      password,
      password2,
      first_name,
      last_name,
    });
  } else {
    try {
      const existingUser = await User.findOne({ account: account });
      if (existingUser) {
        errors.push({ msg: '账户已存在' });
        res.render('register', {
          errors,
          account,
          password,
          password2,
          first_name,
          last_name,
        });
      } else {
        const newUser = new User({
          account,
          password,
        });

        // 哈希密码
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        // 创建用户个人资料
        const newProfile = new Profile({
          uid: newUser._id,
          first_name,
          last_name,
        });
        await newProfile.save();

        req.flash('success_msg', '注册成功，请登录');
        res.redirect('/users/login');
      }
    } catch (err) {
      console.error(err);
      res.render('register', {
        errors: [{ msg: '注册过程中发生错误' }],
        account,
        password,
        password2,
        first_name,
        last_name,
      });
    }
  }
});

// 登录页面
router.get('/login', (req, res) => {
  res.render('login');
});

// 登录处理
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// 登出
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', '你已登出');
    res.redirect('/users/login');
  });
});

module.exports = router;
EOL

# 创建 routes/recipes.js
cat <<EOL > routes/recipes.js
// routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { ensureAuthenticated } = require('../config/auth');

// 添加新食谱页面
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_recipe');
});

// 添加新食谱处理
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { description, ingredient, instruction } = req.body;
  let errors = [];

  if (!description || !ingredient || !instruction) {
    errors.push({ msg: '请填写所有字段' });
  }

  if (errors.length > 0) {
    res.render('add_recipe', {
      errors,
      description,
      ingredient,
      instruction,
    });
  } else {
    try {
      const newRecipe = new Recipe({
        description,
        ingredient: ingredient.split(',').map(item => item.trim()),
        instruction,
        // photo: 处理上传的图片
      });
      await newRecipe.save();
      req.flash('success_msg', '食谱添加成功');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.render('add_recipe', {
        errors: [{ msg: '添加食谱过程中发生错误' }],
        description,
        ingredient,
        instruction,
      });
    }
  }
});

// 查看单个食谱
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    // 你可以在这里填充评论、点赞等信息
    res.render('recipe', { recipe });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
EOL

# 创建 routes/admin.js
cat <<EOL > routes/admin.js
// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { ensureAdmin } = require('../config/auth');

// 管理员首页
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find().populate('profile');
    res.render('admin', { users });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// 删除用户
router.post('/delete/:id', ensureAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', '用户已删除');
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', '删除用户时发生错误');
    res.redirect('/admin');
  }
});

// 重置用户密码
router.post('/reset-password/:id', ensureAdmin, async (req, res) => {
  const { newPassword } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      req.flash('success_msg', '密码已重置');
    }
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', '重置密码时发生错误');
    res.redirect('/admin');
  }
});

module.exports = router;
EOL

# 创建 views/partials/header.ejs
cat <<EOL > views/partials/header.ejs
<!-- views/partials/header.ejs -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>食谱分享平台</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="/">食谱分享平台</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="切换导航">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ml-auto">
        <% if (user) { %>
          <li class="nav-item">
            <a class="nav-link" href="/profile">个人中心</a>
          </li>
          <% if (user.role === 1) { %>
            <li class="nav-item">
              <a class="nav-link" href="/admin">管理员</a>
            </li>
          <% } %>
          <li class="nav-item">
            <a class="nav-link" href="/users/logout">登出</a>
          </li>
        <% } else { %>
          <li class="nav-item">
            <a class="nav-link" href="/users/login">登录</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/users/register">注册</a>
          </li>
        <% } %>
      </ul>
    </div>
  </nav>

  <div class="container mt-4">
    <% if (success_msg) { %>
      <div class="alert alert-success"><%= success_msg %></div>
    <% } %>
    <% if (error_msg) { %>
      <div class="alert alert-danger"><%= error_msg %></div>
    <% } %>
    <% if (error) { %>
      <div class="alert alert-danger"><%= error %></div>
    <% } %>
EOL

# 创建 views/partials/footer.ejs
cat <<EOL > views/partials/footer.ejs
<!-- views/partials/footer.ejs -->
  </div> <!-- /container -->

  <footer class="footer bg-light text-center py-3">
    <div class="container">
      <span class="text-muted">&copy; 2024 食谱分享平台</span>
    </div>
  </footer>

  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="/js/main.js"></script>
</body>
</html>
EOL

# 创建 views/index.ejs
cat <<EOL > views/index.ejs
<!-- views/index.ejs -->
<%- include('partials/header') %>

<!-- 搜索栏 -->
<div class="row mb-4">
  <div class="col-md-8 offset-md-2">
    <form action="/search" method="GET">
      <div class="input-group">
        <input type="text" class="form-control" name="q" placeholder="搜索食谱..." required>
        <div class="input-group-append">
          <button class="btn btn-primary" type="submit">搜索</button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- 类别导航栏 -->
<div class="mb-4">
  <nav class="nav">
    <a class="nav-link active" href="#">全部</a>
    <a class="nav-link" href="#">早餐</a>
    <a class="nav-link" href="#">午餐</a>
    <a class="nav-link" href="#">晚餐</a>
    <a class="nav-link" href="#">甜点</a>
    <!-- 添加更多类别 -->
  </nav>
</div>

<!-- Daily Recipe -->
<div class="mb-4">
  <h3>每日推荐</h3>
  <% if (dailyRecipe) { %>
    <div class="card mb-3" style="max-width: 540px;">
      <div class="row no-gutters">
        <div class="col-md-4">
          <img src="<%= dailyRecipe.photo %>" class="card-img" alt="每日推荐食谱">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title"><a href="/recipes/<%= dailyRecipe._id %>"><%= dailyRecipe.description %></a></h5>
            <p class="card-text">喜欢数: <%= dailyRecipe.likes %></p>
            <a href="/recipes/<%= dailyRecipe._id %>" class="btn btn-sm btn-primary">查看食谱</a>
          </div>
        </div>
      </div>
    </div>
    <button id="refresh-daily" class="btn btn-secondary">刷新</button>
  <% } else { %>
    <p>暂无每日推荐食谱。</p>
  <% } %>
</div>

<!-- Hot Recipes -->
<div class="mb-4">
  <h3>热门食谱</h3>
  <div class="row">
    <% hotRecipes.forEach(recipe => { %>
      <div class="col-md-4">
        <div class="card mb-3">
          <img src="<%= recipe.photo %>" class="card-img-top" alt="热门食谱">
          <div class="card-body">
            <h5 class="card-title"><a href="/recipes/<%= recipe._id %>"><%= recipe.description %></a></h5>
            <p class="card-text">喜欢数: <%= recipe.likes %></p>
          </div>
        </div>
      </div>
    <% }) %>
  </div>
</div>

<!-- Top Cooks -->
<div class="mb-4">
  <h3>顶级厨师</h3>
  <div class="row">
    <% topCooks.forEach(cook => { %>
      <div class="col-md-4">
        <div class="card mb-3">
          <img src="<%= cook.profile.photo || '/images/default-avatar.png' %>" class="card-img-top" alt="厨师头像">
          <div class="card-body">
            <h5 class="card-title"><%= cook.profile.first_name %> <%= cook.profile.last_name %></h5>
            <p class="card-text">喜欢数: <!-- 根据需要添加数据 --></p>
          </div>
        </div>
      </div>
    <% }) %>
  </div>
</div>

<%- include('partials/footer') %>
EOL

# 创建 views/register.ejs
cat <<EOL > views/register.ejs
<!-- views/register.ejs -->
<%- include('partials/header') %>

<h2>注册</h2>
<form action="/users/register" method="POST">
  <% if (typeof errors !== 'undefined' && errors.length > 0) { %>
    <div class="alert alert-danger">
      <ul>
        <% errors.forEach(error => { %>
          <li><%= error.msg %></li>
        <% }) %>
      </ul>
    </div>
  <% } %>
  
  <div class="form-group">
    <label for="account">账户</label>
    <input type="text" class="form-control" id="account" name="account" value="<%= typeof account !== 'undefined' ? account : '' %>" required>
  </div>
  <div class="form-group">
    <label for="first_name">名字</label>
    <input type="text" class="form-control" id="first_name" name="first_name" value="<%= typeof first_name !== 'undefined' ? first_name : '' %>" required>
  </div>
  <div class="form-group">
    <label for="last_name">姓氏</label>
    <input type="text" class="form-control" id="last_name" name="last_name" value="<%= typeof last_name !== 'undefined' ? last_name : '' %>" required>
  </div>
  <div class="form-group">
    <label for="password">密码</label>
    <input type="password" class="form-control" id="password" name="password" required>
  </div>
  <div class="form-group">
    <label for="password2">确认密码</label>
    <input type="password" class="form-control" id="password2" name="password2" required>
  </div>
  <button type="submit" class="btn btn-primary">注册</button>
</form>

<%- include('partials/footer') %>
EOL

# 创建 views/login.ejs
cat <<EOL > views/login.ejs
<!-- views/login.ejs -->
<%- include('partials/header') %>

<h2>登录</h2>
<form action="/users/login" method="POST">
  <% if (typeof errors !== 'undefined' && errors.length > 0) { %>
    <div class="alert alert-danger">
      <ul>
        <% errors.forEach(error => { %>
          <li><%= error.msg %></li>
        <% }) %>
      </ul>
    </div>
  <% } %>

  <div class="form-group">
    <label for="account">账户</label>
    <input type="text" class="form-control" id="account" name="account" required>
  </div>
  <div class="form-group">
    <label for="password">密码</label>
    <input type="password" class="form-control" id="password" name="password" required>
  </div>
  <button type="submit" class="btn btn-primary">登录</button>
  <a href="#" class="btn btn-link">忘记密码？</a>
</form>

<%- include('partials/footer') %>
EOL

# 创建 views/recipe.ejs
cat <<EOL > views/recipe.ejs
<!-- views/recipe.ejs -->
<%- include('partials/header') %>

<div class="card mb-4">
  <img src="<%= recipe.photo %>" class="card-img-top" alt="食谱图片">
  <div class="card-body">
    <h3 class="card-title"><%= recipe.description %></h3>
    <h5>食材</h5>
    <ul>
      <% recipe.ingredient.forEach(item => { %>
        <li><%= item %></li>
      <% }) %>
    </ul>
    <h5>做法</h5>
    <p><%= recipe.instruction %></p>
    <p>喜欢数: <%= recipe.likes %></p>
    <!-- 你可以添加点赞按钮和评论功能 -->
  </div>
</div>

<div class="comments-section">
  <h4>评论</h4>
  <!-- 显示评论 -->
  <% /* 遍历评论并显示 */ %>
</div>

<%- include('partials/footer') %>
EOL

# 创建 views/add_recipe.ejs
cat <<EOL > views/add_recipe.ejs
<!-- views/add_recipe.ejs -->
<%- include('partials/header') %>

<h2>添加新食谱</h2>
<form action="/recipes/add" method="POST" enctype="multipart/form-data">
  <% if (typeof errors !== 'undefined' && errors.length > 0) { %>
    <div class="alert alert-danger">
      <ul>
        <% errors.forEach(error => { %>
          <li><%= error.msg %></li>
        <% }) %>
      </ul>
    </div>
  <% } %>

  <div class="form-group">
    <label for="description">食谱描述</label>
    <input type="text" class="form-control" id="description" name="description" value="<%= typeof description !== 'undefined' ? description : '' %>" required>
  </div>
  <div class="form-group">
    <label for="ingredient">食材（逗号分隔）</label>
    <input type="text" class="form-control" id="ingredient" name="ingredient" value="<%= typeof ingredient !== 'undefined' ? ingredient : '' %>" required>
  </div>
  <div class="form-group">
    <label for="instruction">做法</label>
    <textarea class="form-control" id="instruction" name="instruction" rows="5" required><%= typeof instruction !== 'undefined' ? instruction : '' %></textarea>
  </div>
  <div class="form-group">
    <label for="photo">食谱图片</label>
    <input type="file" class="form-control-file" id="photo" name="photo">
  </div>
  <button type="submit" class="btn btn-primary">添加食谱</button>
</form>

<%- include('partials/footer') %>
EOL

# 创建 views/admin.ejs
cat <<EOL > views/admin.ejs
<!-- views/admin.ejs -->
<%- include('partials/header') %>

<h2>管理员页面</h2>
<table class="table table-striped">
  <thead>
    <tr>
      <th>账户</th>
      <th>角色</th>
      <th>操作</th>
    </tr>
  </thead>
  <tbody>
    <% users.forEach(user => { %>
      <tr>
        <td><%= user.account %></td>
        <td><%= user.role === 1 ? '管理员' : '普通用户' %></td>
        <td>
          <form action="/admin/delete/<%= user._id %>" method="POST" style="display:inline;">
            <button type="submit" class="btn btn-danger btn-sm">删除</button>
          </form>
          <form action="/admin/reset-password/<%= user._id %>" method="POST" style="display:inline;">
            <input type="password" name="newPassword" placeholder="新密码" required>
            <button type="submit" class="btn btn-warning btn-sm">重置密码</button>
          </form>
        </td>
      </tr>
    <% }) %>
  </tbody>
</table>

<%- include('partials/footer') %>
EOL

# 创建 public/css/styles.css
cat <<EOL > public/css/styles.css
/* public/css/styles.css */

/* 自定义导航栏样式 */
.navbar-brand {
  font-weight: bold;
}

/* 食谱卡片样式 */
.card-img-top {
  height: 200px;
  object-fit: cover;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-img-top {
    height: 150px;
  }
}
EOL

# 创建 public/js/main.js
cat <<EOL > public/js/main.js
// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  const refreshDailyBtn = document.getElementById('refresh-daily');
  if (refreshDailyBtn) {
    refreshDailyBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/daily-recipe');
        const data = await response.json();
        // 更新每日推荐食谱内容
        // 需要在后端实现相应的 API 路由
        // 这里仅为示例，具体实现根据需求调整
        location.reload();
      } catch (error) {
        console.error('Error fetching daily recipe:', error);
      }
    });
  }
});
EOL

# 创建 views/admin.ejs
# Note: Already created above

# 创建 views/search.ejs
cat <<EOL > views/search.ejs
<!-- views/search.ejs -->
<%- include('partials/header') %>

<h2>搜索结果 for "<%= query %>"</h2>
<div class="row">
  <% if (recipes.length > 0) { %>
    <% recipes.forEach(recipe => { %>
      <div class="col-md-4">
        <div class="card mb-3">
          <img src="<%= recipe.photo %>" class="card-img-top" alt="食谱">
          <div class="card-body">
            <h5 class="card-title"><a href="/recipes/<%= recipe._id %>"><%= recipe.description %></a></h5>
            <p class="card-text">喜欢数: <%= recipe.likes %></p>
          </div>
        </div>
      </div>
    <% }) %>
  <% } else { %>
    <p>没有找到相关食谱。</p>
  <% } %>
</div>

<%- include('partials/footer') %>
EOL

# 创建 views/profile.ejs
cat <<EOL > views/profile.ejs
<!-- views/profile.ejs -->
<%- include('partials/header') %>

<h2>个人中心</h2>
<!-- 显示和编辑用户个人资料 -->
<!-- 需要根据需求添加内容 -->

<%- include('partials/footer') %>
EOL

# 创建 views/admin.ejs
# Already created above

# 创建 seed.js
cat <<EOL > seed.js
// seed.js
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const User = require('./models/User');
const Profile = require('./models/Profile');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected for seeding');

  // 清空现有数据
  await Recipe.deleteMany({});
  await User.deleteMany({});
  await Profile.deleteMany({});

  // 创建用户
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const user = new User({
    account: 'admin',
    password: hashedPassword, // 已加密
    role: 1,
  });
  await user.save();

  const profile = new Profile({
    uid: user._id,
    first_name: '管理员',
    last_name: '用户',
  });
  await profile.save();

  // 创建食谱
  const recipe = new Recipe({
    description: '番茄炒蛋',
    ingredient: ['番茄', '鸡蛋', '盐', '糖', '油'],
    instruction: '1. 打鸡蛋。2. 切番茄。3. 炒鸡蛋。4. 加入番茄。5. 调味。',
    photo: '/images/tomato-egg.jpg',
    likes: 10,
  });
  await recipe.save();

  console.log('Database seeded');
  mongoose.connection.close();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
EOL

# # 创建 .env 文件
# cat <<EOL > .env
# # .env 文件
# MONGODB_URI=mongodb://localhost:27017/recipe-app
# PORT=3000
# SESSION_SECRET=your_secret_key
# EOL

# 创建 public/images/default-avatar.png
# 由于脚本无法直接创建图片，请手动添加一张默认头像到 public/images 目录下，并命名为 default-avatar.png

# # 创建 README.md
# cat <<EOL > README.md
# # 食谱分享平台

# 这是一个功能完备的食谱分享平台，允许用户注册、登录、添加食谱、评论、点赞等功能。管理员可以管理用户和食谱。

# ## 项目结构



