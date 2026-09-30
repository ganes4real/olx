const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Item = require('../models/Item');

// POST /api/favorites/toggle/:itemId - Toggle favorite
router.post('/toggle/:itemId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const existing = await Favorite.findOne({ userId, itemId });
    let isFavorite = false;

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      isFavorite = false;
    } else {
      await Favorite.create({ userId, itemId });
      isFavorite = true;
    }

    // Get updated total favorites list for this user
    const favorites = await Favorite.find({ userId }).select('itemId');
    const favoriteIds = favorites.map(f => f.itemId.toString());

    res.json({
      success: true,
      isFavorite,
      favoritesCount: favoriteIds.length,
      favoriteIds
    });
  } catch (err) {
    console.error('Favorite toggle error:', err);
    res.status(500).json({ success: false, message: 'Error updating favorite' });
  }
});

// GET /api/favorites/user/:userId - Get full populated favorite items
router.get('/user/:userId', async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.params.userId })
      .populate('itemId')
      .sort({ createdAt: -1 });

    // Filter out any items that might have been deleted
    const validItems = favorites
      .filter(f => f.itemId != null)
      .map(f => f.itemId);

    res.json({
      success: true,
      count: validItems.length,
      items: validItems
    });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ success: false, message: 'Error fetching favorites' });
  }
});

// GET /api/favorites/ids/:userId - Get list of favorited item IDs
router.get('/ids/:userId', async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.params.userId }).select('itemId');
    const ids = favorites.map(f => f.itemId.toString());
    res.json({ success: true, favoriteIds: ids });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching favorite IDs' });
  }
});

module.exports = router;
