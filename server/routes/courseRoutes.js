const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken); // Protect all course routes

router.get('/', CourseController.getCourses);
router.get('/instructor', CourseController.getInstructorCourses);
router.post('/', CourseController.createCourse);
router.get('/:id', CourseController.getCourseDetails);
router.put('/:id', CourseController.updateCourse);
router.patch('/:id/publish', CourseController.togglePublish);
router.get('/:id/attendees', CourseController.getAttendees);
router.post('/:id/attendees', CourseController.addAttendee);
router.get('/:id/eligible-learners', CourseController.getEligibleLearners);
router.delete('/:id', CourseController.deleteCourse);

module.exports = router;
