const express = require('express');
const router = express.Router();
const multer = require('multer');
const http = require('http');
const https = require('https');
const Item = require('../models/Item');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Report = require('../models/Report');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { LOCATIONS } = require('../data/locations');

// Memory storage for multer so we can directly store the actual image buffer in MongoDB as Base64 Data URL
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = file.originalname.split('.').pop().toLowerCase();
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) || allowed.test(mime)) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed!'));
  }
});

// Helper: Convert URL to Base64 image
function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: status code ${res.statusCode}`));
      }
      const contentType = res.headers['content-type'] || 'image/jpeg';
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
        resolve(base64);
      });
    }).on('error', reject);
  });
}

// GET /api/items - Get listings with filters, search, and sorting
router.get('/', async (req, res) => {
  try {
    const { search, category, location, minPrice, maxPrice, sort, userId, status } = req.query;
    let query = {};

    // Filter by status (default shows 'listed', or specific status if requested, or all for admin)
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // By default on public feeds, show active listed and optionally sold if desired
      // We keep listed as primary
    }

    // Filter by specific user
    if (userId) {
      query.userId = userId;
    }

    // Search keyword in title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== 'ALL CATEGORIES') {
      query.category = category;
    }

    // Location filter
    if (location && location !== 'All' && location !== 'India' && location !== '') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const items = await Item.find(query).sort(sortOption);
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ success: false, message: 'Server error fetching items' });
  }
});

// GET /api/items/meta/categories - Category counts
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [
      'Cars',
      'Motorcycles',
      'Mobile Phones',
      'Houses & Apartments',
      'Scooters',
      'Commercial Vehicles',
      'Electronics & Appliances',
      'Furniture',
      'Fashion',
      'Other'
    ];

    const counts = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => {
      countMap[c._id] = c.count;
    });

    const result = categories.map(cat => ({
      name: cat,
      count: countMap[cat] || 0
    }));

    res.json({ success: true, categories: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/items/:id - Get single item with seller details
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'name email phone createdAt role');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Increment view count
    item.views = (item.views || 0) + 1;
    await item.save();

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving item' });
  }
});

// POST /api/items - Post a new listing with image stored directly in Database as Base64 Data URI
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      location,
      imageUrl,
      imageBase64,
      userId,
      sellerName,
      sellerPhone
    } = req.body;

    if (!title || !description || !price || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields: title, description, price, category, location'
      });
    }

    // Resolve seller user
    let userObj = null;
    if (userId) {
      userObj = await User.findById(userId);
    }
    if (!userObj) {
      // Find or use default active user
      userObj = await User.findOne();
      if (!userObj) {
        userObj = new User({
          name: sellerName || 'Verified Seller',
          email: 'seller@olx.com',
          password: 'password123',
          phone: sellerPhone || '+91 98765 43210'
        });
        await userObj.save();
      }
    }

    // Process actual image to store directly in MongoDB as Base64 Data URL
    let finalImageBase64 = '';

    if (req.file) {
      // Uploaded from file input -> directly convert file buffer to base64 data URL
      const mime = req.file.mimetype || 'image/jpeg';
      finalImageBase64 = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
    } else if (imageBase64 && imageBase64.startsWith('data:image')) {
      // Provided as direct base64 data URL
      finalImageBase64 = imageBase64;
    } else if (imageUrl && imageUrl.trim().startsWith('http')) {
      // Download remote image and convert to Base64 so it is stored directly in DB!
      try {
        finalImageBase64 = await fetchImageAsBase64(imageUrl.trim());
      } catch (e) {
        console.warn('Could not convert external image to base64, using fallback SVG base64:', e.message);
        finalImageBase64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23002f34"/><text x="50%" y="50%" fill="%2300a49f" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${encodeURIComponent(title.slice(0, 30))}</text></svg>`;
      }
    } else {
      // Default placeholder as actual inline base64 SVG data
      finalImageBase64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23002f34"/><text x="50%" y="45%" fill="%23ffce32" font-family="sans-serif" font-size="34" font-weight="bold" text-anchor="middle">OLX Marketplace</text><text x="50%" y="60%" fill="%23ffffff" font-family="sans-serif" font-size="20" text-anchor="middle">${encodeURIComponent(title.slice(0, 25))}</text></svg>`;
    }

    const newItem = new Item({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      location: location.trim(),
      image: finalImageBase64, // Stored as actual image in MongoDB
      userId: userObj._id,
      sellerName: (sellerName && sellerName.trim()) || userObj.name || 'Verified Seller',
      sellerPhone: (sellerPhone && sellerPhone.trim()) || userObj.phone || '+91 98765 43210',
      sellerMemberSince: userObj.createdAt
        ? new Date(userObj.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Jan 2024',
      status: 'listed'
    });

    const saved = await newItem.save();
    res.status(201).json({ success: true, message: 'Ad posted successfully!', item: saved });
  } catch (err) {
    console.error('Error creating ad:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error creating ad' });
  }
});

// PUT /api/items/:id/status - Update item status (listed, sold, reserved)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['listed', 'sold', 'reserved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.status = status;
    await item.save();

    res.json({ success: true, message: `Listing marked as ${status}`, item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
});

// DELETE /api/items/:id - Delete an item and cleanup associated data
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Cascade delete favorites and reports related to this item
    await Favorite.deleteMany({ itemId: item._id });
    await Report.deleteMany({ itemId: item._id });

    // Also remove chats for this item
    const chats = await Chat.find({ itemId: item._id });
    const chatIds = chats.map(c => c._id);
    await Message.deleteMany({ chatId: { $in: chatIds } });
    await Chat.deleteMany({ itemId: item._id });

    await Item.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ success: false, message: 'Server error deleting ad' });
  }
});

module.exports = router;
