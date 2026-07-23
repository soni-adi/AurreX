const User = require('../models/User');
const createDemoUser = async () => {
  try {
    if (await User.findOne({ username: 'demo' })) return;
    await new User({ username:'demo', email:'demo@aurrex.com', password:'Demo@1234', isVerified:true }).save();
    console.log('✅ Demo user created → username: demo  password: Demo@1234');
  } catch (err) { console.error('Seed error:', err.message); }
};
module.exports = { createDemoUser };