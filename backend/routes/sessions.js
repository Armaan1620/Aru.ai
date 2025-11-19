const express = require('express');
const ChatSession = require('../models/ChatSession');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes here require authentication
router.use(auth);

// @route   GET /api/sessions
// @desc    List chat sessions for the authenticated user
router.get('/', async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user.id })
      .sort({ lastActivityAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error('Get sessions error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sessions
// @desc    Create a new chat session for the authenticated user
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    const session = new ChatSession({
      user: req.user.id,
      title: title && title.trim() ? title.trim() : 'New chat',
    });

    await session.save();

    res.status(201).json(session);
  } catch (err) {
    console.error('Create session error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a chat session and its messages for the authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Delete all chats in this session for this user
    await Chat.deleteMany({ user: req.user.id, session: session._id });

    // Delete the session itself
    await session.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error('Delete session error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
