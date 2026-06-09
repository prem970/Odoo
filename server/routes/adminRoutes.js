const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

router.get('/stats', authenticateToken, isAdmin, AdminController.getStats);
router.get('/enrollments', authenticateToken, isAdmin, AdminController.getEnrollments);

module.exports = router;
