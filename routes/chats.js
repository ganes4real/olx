const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Item = require('../models/Item');
const User = require('../models/User');

// POST /api/chats/start - Start or find an existing chat
router.post('/start', async (req, res) => {
  try {
    const { itemId, buyerId, initialMessage } = req.body;

    if (!itemId || !buyerId) {
      return res.status(400).json({ success: false, message: 'Item ID and Buyer ID are required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const sellerId = item.userId.toString();
    if (sellerId === buyerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself on your own listing.'
      });
    }

    // Look for existing chat for this item and buyer
    let chat = await Chat.findOne({
      itemId: item._id,
      participants: { $all: [buyerId, sellerId] }
    });

    const buyerUser = await User.findById(buyerId);

    if (!chat) {
      chat = new Chat({
        participants: [buyerId, sellerId],
        itemId: item._id,
        lastMessage: initialMessage || 'Interested in your item',
        lastMessageSender: buyerId,
        lastMessageAt: new Date()
      });
      await chat.save();

      // Create initial message
      const msg = new Message({
        chatId: chat._id,
        senderId: buyerId,
        senderName: buyerUser ? buyerUser.name : 'Buyer',
        text: initialMessage || `Hi, is this "${item.title}" still available?`
      });
      await msg.save();
      chat.lastMessage = msg.text;
      await chat.save();
    } else if (initialMessage && initialMessage.trim() !== '') {
      const msg = new Message({
        chatId: chat._id,
        senderId: buyerId,
        senderName: buyerUser ? buyerUser.name : 'Buyer',
        text: initialMessage.trim()
      });
      await msg.save();
      chat.lastMessage = msg.text;
      chat.lastMessageSender = buyerId;
      chat.lastMessageAt = new Date();
      await chat.save();
    }

    // Populate for response
    await chat.populate('participants', 'name email phone role');
    await chat.populate('itemId', 'title price image location status sellerName sellerPhone');

    res.status(200).json({ success: true, chat });
  } catch (err) {
    console.error('Error starting chat:', err);
    res.status(500).json({ success: false, message: 'Server error starting conversation' });
  }
});

// GET /api/chats/user/:userId - Get all conversations for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({
      participants: userId
    })
      .populate('participants', 'name email phone role')
      .populate('itemId', 'title price image location status sellerName sellerPhone')
      .sort({ updatedAt: -1 });

    // Filter out chats where item might have been completely deleted or sanitize
    res.json({ success: true, count: chats.length, chats });
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ success: false, message: 'Error fetching conversations' });
  }
});

// GET /api/chats/:chatId/messages - Get all messages for a specific conversation
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email phone role')
      .populate('itemId', 'title price image location status sellerName sellerPhone');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    // Mark messages as read if userId provided and sender is someone else
    if (userId) {
      await Message.updateMany(
        { chatId, senderId: { $ne: userId }, read: false },
        { $set: { read: true } }
      );
    }

    res.json({ success: true, chat, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Error retrieving messages' });
  }
});

// POST /api/chats/:chatId/messages - Send a message in a conversation
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, senderName, text } = req.body;

    if (!senderId || !text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Sender ID and text are required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const user = await User.findById(senderId);
    const finalSenderName = (user && user.name) || senderName || 'User';

    const newMessage = new Message({
      chatId,
      senderId,
      senderName: finalSenderName,
      text: text.trim()
    });

    const savedMessage = await newMessage.save();

    chat.lastMessage = text.trim();
    chat.lastMessageSender = senderId;
    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(201).json({ success: true, message: savedMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;
