const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favorites');
const reportRoutes = require('./routes/reports');
const chatRoutes = require('./routes/chats');
const adminRoutes = require('./routes/admin');
const locationRoutes = require('./routes/locations');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/olx_clone';

// Middlewares - Increased payload limit to accommodate in-database Base64 images
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);

// Fallback to index.html for SPA-like navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection & Server initialization
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB database (olx_clone)');
    app.listen(PORT, () => {
      console.log(`🚀 OLX Clone Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    app.listen(PORT, () => {
      console.log(`⚠️ OLX Clone Server running without active MongoDB at http://localhost:${PORT}`);
    });
  });
