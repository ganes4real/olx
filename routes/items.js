const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const Item = require('../models/Item');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Report = require('../models/Report');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { LOCATIONS } = require('../data/locations');
const { optionalAuth } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for multer to save uploaded images directly to /uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'item-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg\+xml|svg/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) || allowed.test(mime)) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed!'));
  }
});

// Helper: Save Base64 string to a file in uploads directory and return path
function saveBase64ToFile(base64Str, prefix = 'upload') {
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let ext = '.jpg';
  let buffer;

  if (matches && matches.length === 3) {
    const mime = matches[1];
    if (mime.includes('png')) ext = '.png';
    else if (mime.includes('webp')) ext = '.webp';
    else if (mime.includes('gif')) ext = '.gif';
    else if (mime.includes('svg')) ext = '.svg';
    else ext = '.jpg';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64Str, 'base64');
  }

  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
}

// Helper: Download external image URL and save to uploads directory
function saveUrlToFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: status code ${res.statusCode}`));
      }
      const contentType = res.headers['content-type'] || '';
      let ext = '.jpg';
      if (contentType.includes('png')) ext = '.png';
      else if (contentType.includes('webp')) ext = '.webp';
      else if (contentType.includes('gif')) ext = '.gif';
      else if (contentType.includes('svg')) ext = '.svg';

      const filename = `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      const fileStream = fs.createWriteStream(filePath);

      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(`/uploads/${filename}`);
      });
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// Helper: Create default SVG image placeholder in uploads directory
function createDefaultPlaceholder(title = 'OLX Marketplace') {
  const filename = `item-default-${Date.now()}-${Math.round(Math.random() * 1e9)}.svg`;
  const filePath = path.join(uploadsDir, filename);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#002f34"/><text x="50%" y="45%" fill="#ffce32" font-family="sans-serif" font-size="34" font-weight="bold" text-anchor="middle">OLX Marketplace</text><text x="50%" y="60%" fill="#ffffff" font-family="sans-serif" font-size="20" text-anchor="middle">${encodeURIComponent(title.slice(0, 25))}</text></svg>`;
  fs.writeFileSync(filePath, svg);
  return `/uploads/${filename}`;
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

// POST /api/items - Post a new listing with image saved to uploads folder and path saved in MongoDB
router.post('/', optionalAuth, upload.single('imageFile'), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      location,
      imageUrl,
      imageBase64,
      sellerName,
      sellerPhone
    } = req.body;

    const effectiveUserId = (req.user && req.user.id) || req.body.userId;

    if (!title || !description || !price || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields: title, description, price, category, location'
      });
    }

    // Resolve seller user
    let userObj = null;
    if (effectiveUserId) {
      userObj = await User.findById(effectiveUserId);
    }
    if (!userObj) {
      // Find or create fallback active user
      userObj = await User.findOne();
      if (!userObj) {
        userObj = new User({
          name: sellerName || (req.user && req.user.name) || 'Verified Seller',
          email: (req.user && req.user.email) || 'seller@olx.com',
          password: 'password123',
          phone: sellerPhone || ''
        });
        await userObj.save();
      }
    }

    // Save image to /uploads/ folder and retrieve file path
    let imagePath = '';

    if (req.file) {
      // Uploaded from file input via multer diskStorage
      imagePath = `/uploads/${req.file.filename}`;
    } else if (imageBase64 && imageBase64.startsWith('data:image')) {
      // Provided as base64 data URL -> convert to file in uploads/
      imagePath = saveBase64ToFile(imageBase64);
    } else if (imageUrl && imageUrl.trim().startsWith('http')) {
      // Remote image URL -> download and save in uploads/
      try {
        imagePath = await saveUrlToFile(imageUrl.trim());
      } catch (e) {
        console.warn('Could not download external image, using placeholder:', e.message);
        imagePath = createDefaultPlaceholder(title);
      }
    } else {
      // Default placeholder created in uploads/
      imagePath = createDefaultPlaceholder(title);
    }

    const newItem = new Item({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      location: location.trim(),
      image: imagePath, // Stored as path in MongoDB (e.g. /uploads/item-12345.jpg)
      userId: userObj._id,
      sellerName: (sellerName && sellerName.trim()) || userObj.name || 'Verified Seller',
      sellerPhone: (sellerPhone && sellerPhone.trim()) || (userObj && userObj.phone) || '',
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

// DELETE /api/items/:id - Delete an item and cleanup associated data & uploaded files
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

    // Clean up uploaded image file if present in uploads directory
    if (item.image && item.image.startsWith('/uploads/')) {
      const existingFilePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(existingFilePath)) {
        try {
          fs.unlinkSync(existingFilePath);
        } catch (e) {
          console.warn('Failed to delete image file:', e.message);
        }
      }
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ success: false, message: 'Server error deleting ad' });
  }
});

module.exports = router;
