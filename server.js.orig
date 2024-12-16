// server.js
// require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
// const passport = require('passport');
// const flash = require('connect-flash');
// const bodyParser = require('body-parser');

// 初始化 Express
const app = express();

// 连接到 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
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
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(session({
//   secret: 'your_secret_key', // 请替换为你的密钥
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
// }));
// app.use(flash());

// // Passport 配置
// require('./config/passport')(passport);
// app.use(passport.initialize());
// app.use(passport.session());

// // 设置全局变量
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next();
// });

// 路由
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/recipes', require('./routes/recipes'));
app.use('/admin', require('./routes/admin'));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
