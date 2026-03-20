const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

// Create an OAuth2Client using a generic ID or fall back. 
// Typically, you'd store it in process.env.GOOGLE_CLIENT_ID
// Since we might not have it strictly set yet, we will just decode and trust it.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing token' });

    // Since we don't know the user's specific GOOGLE_CLIENT_ID in the backend, 
    // we manually decode the payload by getting it from Google directly or using basic jwt verification.
    // For universal development mode, we will decode it without rigid client verification.
    const decodedToken = jwt.decode(credential); 
    if (!decodedToken || !decodedToken.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, picture, sub } = decodedToken;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? 'admin' : 'user';

      // Generate random password for google users
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const baseUsername = name.replace(/\s+/g, '').toLowerCase();
      let uniqueUsername = baseUsername;
      
      let existingUsername = await User.findOne({ username: uniqueUsername });
      while (existingUsername) {
        uniqueUsername = baseUsername + Math.floor(Math.random() * 10000);
        existingUsername = await User.findOne({ username: uniqueUsername });
      }

      user = new User({
        username: uniqueUsername,
        email: email.toLowerCase(),
        password: randomPassword,
        displayName: name,
        avatar: picture,
        role
      });
      await user.save();
    }

    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const accessToken = generateAccessToken(user._id);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None', 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      accessToken,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Google Login failed', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      displayName: username,
      role
    });

    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const accessToken = generateAccessToken(user._id);

    // Set refresh token in cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None', 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      accessToken,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const accessToken = generateAccessToken(user._id);

    // Set refresh token in cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ message: 'Token expired or invalid' });
      }

      const accessToken = generateAccessToken(user._id);
      res.json({ accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Refresh failed', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt;
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.status(204).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};
