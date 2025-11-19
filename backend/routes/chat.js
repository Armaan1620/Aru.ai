const express = require('express');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes here require authentication
router.use(auth);

// @route   POST /api/chats
// @desc    Save a new chat message for the authenticated user
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const chat = new Chat({
      user: req.user.id,
      message,
    });

    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    console.error('Create chat error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chats
// @desc    Get all previous chats for the authenticated user
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    console.error('Get chats error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
