const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getUserMessages,
    getAllMessagesForAdmin,
    updateMessage
} = require('../controllers/messageController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// User routes (Allow Learners and Instructors to send/receive messages)
router.post('/send', authenticateToken, sendMessage);
router.get('/user', authenticateToken, getUserMessages);

// Admin routes
router.get('/admin', authenticateToken, authorizeRole('ADMIN'), getAllMessagesForAdmin);
router.put('/update/:id', authenticateToken, authorizeRole('ADMIN'), updateMessage);

module.exports = router;
