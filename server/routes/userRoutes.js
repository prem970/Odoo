const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);


router.get('/instructors', UserController.getInstructors);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/change-password', UserController.changePassword);
router.get('/', UserController.getAllUsers);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
