const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');

const { authenticateToken } = require('../middleware/auth');

// Forward requests to Grok (protected)
router.post('/chat', authenticateToken, ChatController.chat);

module.exports = router;
