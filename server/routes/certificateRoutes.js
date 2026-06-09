const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticateToken } = require('../middleware/auth');

// Generate Certificate (User triggers this upon completion)
router.post('/generate', authenticateToken, certificateController.generate);

// Get my certificate for a specific course
router.get('/course/:courseId', authenticateToken, certificateController.getMyCertificate);

// Download Certificate (Public or Protected? Usually protected or shareable link)
// Making it public for easy download if they have the ID, often standard for certs.
router.get('/download/:id', certificateController.download);

module.exports = router;
