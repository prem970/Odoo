const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const AssignmentController = require('../controllers/AssignmentController');

router.use(authenticateToken);

router.get('/', AssignmentController.getAssignments);
router.post('/submit', AssignmentController.submitWork);

module.exports = router;
