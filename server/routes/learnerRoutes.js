/**
 * Learner Routes
 * Purpose: API endpoints for learners to access courses and track progress.
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const EnrollmentController = require('../controllers/EnrollmentController');
const CourseController = require('../controllers/CourseController');
const LessonController = require('../controllers/LessonController');
const QuizController = require('../controllers/QuizController');

// All routes here should be protected
router.use(authenticateToken);

// Enrollments (My Courses)
router.get('/my-courses', EnrollmentController.getUserEnrollments);
router.get('/profile', EnrollmentController.getLearnerProfile);

// Course Exploration & Catalog
router.get('/courses', CourseController.getCourses);
router.post('/enroll', EnrollmentController.enroll);
router.get('/courses/:id', CourseController.getCourseDetails);
router.get('/courses/:id/reviews', CourseController.getCourseReviews);
router.post('/courses/:id/reviews', CourseController.addReview);

// Lessons
router.get('/courses/:courseId/lessons', LessonController.getLessonsByCourse);
router.post('/lessons/:lessonId/complete', LessonController.markComplete);

// Quizzes
router.get('/my-quizzes', QuizController.getMyQuizzes);
router.get('/quizzes/:quizId', QuizController.getQuizDetails);
router.post('/quizzes/:quizId/submit', QuizController.submitAttempt);

module.exports = router;
