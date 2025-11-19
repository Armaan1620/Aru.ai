const express = require('express');
const Chat = require('../models/Chat');
const ChatSession = require('../models/ChatSession');
const auth = require('../middleware/auth');
const { generateGeminiResponse } = require('../services/gemini');

const router = express.Router();

// All routes here require authentication
router.use(auth);

// @route   POST /api/chats
// @desc    Save a new chat message for the authenticated user and get AI response
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const chat = new Chat({
      user: req.user.id,
      session: session._id,
      message,
    });

    await chat.save();

    // Update session metadata
    session.lastMessagePreview = message.slice(0, 200);
    session.lastActivityAt = new Date();

    // If this is a new chat with a generic title, rename it based on the first message
    if (!session.title || session.title === 'New chat') {
      const trimmed = message.trim();
      const firstLine = trimmed.split('\n')[0];
      const maxLen = 40;
      let newTitle = firstLine.length > maxLen
        ? `${firstLine.slice(0, maxLen)}…`
        : firstLine;
      if (!newTitle) {
        newTitle = 'New chat';
      }
      session.title = newTitle;
    }

    await session.save();

    let aiResponse = '';

    try {
      aiResponse = await generateGeminiResponse(message);
    } catch (aiError) {
      console.error('Gemini AI error:', aiError.message || aiError);
      aiResponse =
        'I had trouble generating a response just now. Please try asking again.';
    }

    res.status(201).json({ chat, aiResponse, session });
  } catch (err) {
    console.error('Create chat error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chats
// @desc    Get all previous chats for the authenticated user in a session
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId query param is required' });
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const chats = await Chat.find({ user: req.user.id, session: session._id })
      .sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    console.error('Get chats error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
