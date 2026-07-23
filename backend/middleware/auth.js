'use strict';
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Cookie-only authentication guard.
 *
 * We intentionally reject Authorization headers — the access token lives
 * exclusively in an httpOnly cookie, which JavaScript cannot read, closing
 * the most common XSS token-theft vector.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select('-password -otp -refreshTokens').lean();
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticate };
