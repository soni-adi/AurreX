const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = { authenticate: async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select('-password -otp -refreshTokens');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user; next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    res.status(401).json({ error: 'Invalid token' });
  }
}};