const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an item title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
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
    ]
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  // Stored as full base64 data image URI directly inside the MongoDB document
  image: {
    type: String,
    required: [true, 'Please provide an item image']
  },
  // Linked user ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  sellerName: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true
  },
  sellerPhone: {
    type: String,
    required: [true, 'Seller phone is required'],
    trim: true
  },
  sellerMemberSince: {
    type: String,
    default: 'Jan 2024'
  },
  // Item status: listed, sold, reserved
  status: {
    type: String,
    enum: ['listed', 'sold', 'reserved'],
    default: 'listed'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search & queries
itemSchema.index({ title: 'text', description: 'text' });
itemSchema.index({ category: 1, location: 1, status: 1 });
itemSchema.index({ userId: 1 });

module.exports = mongoose.model('Item', itemSchema);
