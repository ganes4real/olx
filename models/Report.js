const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemTitle: {
    type: String,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerName: {
    type: String,
    default: 'Unknown Seller'
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporterName: {
    type: String,
    default: 'Anonymous'
  },
  reporterEmail: {
    type: String
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Scam or Fraud',
      'Counterfeit Product',
      'Inappropriate Content',
      'Duplicate Ad',
      'Misleading Information',
      'Other'
    ]
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.index({ itemId: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
