const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const Report = require('../models/Report');
const Favorite = require('../models/Favorite');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// GET /api/admin/stats - Overview metrics
router.get('/stats', async (req, res) => {
  try {
    const [totalItems, listedItems, soldItems, reservedItems, totalUsers, totalReports, pendingReports, totalChats] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'listed' }),
      Item.countDocuments({ status: 'sold' }),
      Item.countDocuments({ status: 'reserved' }),
      User.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Chat.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        totalItems,
        listedItems,
        soldItems,
        reservedItems,
        totalUsers,
        totalReports,
        pendingReports,
        totalChats
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ success: false, message: 'Server error fetching statistics' });
  }
});

// GET /api/admin/items - View all items with report info
router.get('/items', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { sellerName: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });

    // Attach report counts to each item
    const itemIds = items.map(i => i._id);
    const reportCounts = await Report.aggregate([
      { $match: { itemId: { $in: itemIds } } },
      { $group: { _id: '$itemId', count: { $sum: 1 } } }
    ]);
    const reportMap = {};
    reportCounts.forEach(r => {
      reportMap[r._id.toString()] = r.count;
    });

    const itemsWithReports = items.map(item => ({
      ...item.toObject(),
      reportCount: reportMap[item._id.toString()] || 0
    }));

    res.json({ success: true, count: itemsWithReports.length, items: itemsWithReports });
  } catch (err) {
    console.error('Error fetching admin items:', err);
    res.status(500).json({ success: false, message: 'Error retrieving items' });
  }
});

// DELETE /api/admin/items/:id - Admin delete item
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Cascade delete favorites, reports, and chats
    await Favorite.deleteMany({ itemId: item._id });
    await Report.deleteMany({ itemId: item._id });

    const chats = await Chat.find({ itemId: item._id });
    const chatIds = chats.map(c => c._id);
    await Message.deleteMany({ chatId: { $in: chatIds } });
    await Chat.deleteMany({ itemId: item._id });

    await Item.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `Item "${item.title}" successfully deleted by Admin.` });
  } catch (err) {
    console.error('Error admin deleting item:', err);
    res.status(500).json({ success: false, message: 'Error deleting item' });
  }
});

// PUT /api/admin/items/:id/status - Admin update status
router.put('/items/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['listed', 'sold', 'reserved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const item = await Item.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: `Item status updated to ${status}`, item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
});

// GET /api/admin/users - Get all users with item counts (without add admin option)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const userIds = users.map(u => u._id);
    const itemCounts = await Item.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const itemMap = {};
    itemCounts.forEach(c => {
      itemMap[c._id.toString()] = c.count;
    });

    const usersWithStats = users.map(u => ({
      ...u.toObject(),
      itemsCount: itemMap[u._id.toString()] || 0
    }));

    res.json({ success: true, count: usersWithStats.length, users: usersWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// DELETE /api/admin/users/:id - Delete user and their listings
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user's items
    await Item.deleteMany({ userId: user._id });
    await Favorite.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User and all their listings removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

module.exports = router;
