const express = require('express');
const router = express.Router();
const LessonController = require('../controllers/LessonController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken); // Protect all lesson routes

router.get('/course/:courseId', LessonController.getLessonsByCourse);
router.post('/', LessonController.addLesson);
router.put('/reorder', LessonController.reorderLessons); // Must be before /:id
router.put('/:id', LessonController.updateLesson);
router.delete('/:id', LessonController.deleteLesson);

module.exports = router;
