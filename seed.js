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
