'use strict';
const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { sendOTP }      = require('../utils/email');
const { authenticate } = require('../middleware/auth');

const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signTokens = (userId) => ({
  accessToken:  jwt.sign({ userId }, process.env.JWT_SECRET,         { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET,  { expiresIn: '30d' }),
});

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge,
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken',  accessToken,  cookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, cookieOptions(30 * 24 * 60 * 60 * 1000));
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken',  { httpOnly: true, sameSite: 'strict' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
};

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });
    if (existing)
      return res.status(400).json({
        error: existing.email === email.toLowerCase() ? 'Email already registered' : 'Username already taken',
      });

    const otp = genOTP();
    const user = await new User({
      username:   username.toLowerCase().trim(),
      email:      email.toLowerCase().trim(),
      password,
      isVerified: false,
      otp:        { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    }).save();

    await sendOTP(user.email, otp, 'verify');
    res.status(201).json({ message: 'OTP sent to your email', email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user)         return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified' });
    if (!user.otp?.code || user.otp.code !== otp)
      return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.otp.expiresAt)
      return res.status(400).json({ error: 'OTP expired — request a new one' });

    user.isVerified = true;
    user.otp        = undefined;
    const { accessToken, refreshToken } = signTokens(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ message: 'Account verified', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    });
    if (!user)
      return res.status(401).json({ error: 'Invalid username or password' });
    if (!user.isVerified)
      return res.status(401).json({ error: 'Account not verified — check your email for OTP' });
    if (!await user.comparePassword(password))
      return res.status(401).json({ error: 'Invalid username or password' });

    const { accessToken, refreshToken } = signTokens(user._id);
    if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
    user.refreshTokens.push(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ message: 'Login successful', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const { userId } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(userId);
    if (!user || !user.refreshTokens.includes(token))
      return res.status(401).json({ error: 'Invalid refresh token' });

    const { accessToken, refreshToken } = signTokens(user._id);
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.refreshTokens.push(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user: user.toJSON() });
  } catch {
    res.status(401).json({ error: 'Refresh token invalid or expired — please log in again' });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token },
      });
    }
    clearAuthCookies(res);
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    const otp = genOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();
    await sendOTP(email, otp, 'reset');
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/verify-reset-otp ──────────────────────────────────────────
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.otp?.code || user.otp.code !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.otp.expiresAt) return res.status(400).json({ error: 'OTP expired' });
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.otp?.code || user.otp.code !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > user.otp.expiresAt) return res.status(400).json({ error: 'OTP expired' });
    user.password = newPassword;
    user.otp      = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
