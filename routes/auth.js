const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');

// Regex patterns for validation
const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,30}$/;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Verify Name with regex
    if (!name || !NAME_REGEX.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain only alphabets and spaces (2 to 50 characters).'
      });
    }

    // 2. Verify Email with regex
    if (!email || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. user@example.com).'
      });
    }

    // 3. Verify Phone Number with regex (10-digit Indian mobile starting with 6-9)
    if (!phone || !PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. +91 9876543210).'
      });
    }

    // 4. Verify Password length & complexity with regex (min 6 chars, at least 1 letter and 1 number)
    if (!password || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and contain at least one letter and one number.'
      });
    }

    // Check if account already exists with this email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Public registration is ALWAYS role: 'user' (cannot register as admin)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Pre-save hook hashes with bcryptjs
      phone: phone.trim(),
      role: 'user'
    });

    await user.save();
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
// Accepts userId or email (e.g. test101 or test101@olx.com) along with password (e.g. pass101)
router.post('/login', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.userId || req.body.username || '').trim().toLowerCase();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide User ID / Email and password' });
    }

    // Find by custom userId, email, or username
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { userId: identifier },
        { email: `${identifier}@olx.com` }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Auto upgrade legacy plain-text password to bcrypt hash
    if (!user.password.startsWith('$2')) {
      user.password = password;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        userId: user.userId || '',
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/users/:id - Public seller profile
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const totalAds = await Item.countDocuments({ userId: user._id });
    const activeAds = await Item.countDocuments({ userId: user._id, status: 'listed' });
    const soldAds = await Item.countDocuments({ userId: user._id, status: 'sold' });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        stats: {
          total: totalAds,
          active: activeAds,
          sold: soldAds
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile' });
  }
});

// GET /api/auth/users/:id/items - All items posted by this specific user
router.get('/users/:id/items', async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.params.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    const user = await User.findById(req.params.id).select('name phone email createdAt');

    res.json({
      success: true,
      count: items.length,
      user,
      items
    });
  } catch (err) {
    console.error('Error fetching user items:', err);
    res.status(500).json({ success: false, message: 'Error fetching user listings' });
  }
});

module.exports = router;
