/**
 * API Routes Entry Point
 */
const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/courses', require('./courseRoutes'));
router.use('/lessons', require('./lessonRoutes'));
router.use('/quizzes', require('./quizRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;
