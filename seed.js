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

  // Clear existing data
  await Recipe.deleteMany({});
  await User.deleteMany({});
  await Profile.deleteMany({});

  // Create user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const user = new User({
    account: 'admin',
    password: hashedPassword, // Hashed
    role: 1,
  });
  await user.save();

  const profile = new Profile({
    uid: user._id,
    first_name: 'Admin',
    last_name: 'User',
  });
  await profile.save();

  // Create recipe
  const recipe = new Recipe({
    description: 'Tomato Scrambled Eggs',
    ingredient: ['Tomatoes', 'Eggs', 'Salt', 'Sugar', 'Oil'],
    instruction: '1. Beat eggs. 2. Chop tomatoes. 3. Scramble eggs. 4. Add tomatoes. 5. Season.',
    photo: '/images/tomato-egg.jpg',
    likes: 10,
  });
  await recipe.save();

  console.log('Database seeded');
  mongoose.connection.close();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
