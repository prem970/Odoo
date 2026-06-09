const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const LiveClassController = require('../controllers/LiveClassController');

// Public or Protected? Let's protect all for now
router.use(authenticateToken);

router.get('/', LiveClassController.getSessions);
router.post('/', LiveClassController.createSession); // Should check for instructor role
router.get('/:id', LiveClassController.getSessionInternal);
router.post('/:id/join', LiveClassController.joinSession);

module.exports = router;
