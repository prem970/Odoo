const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/QuizController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken); // Protect all quiz routes

// Quiz CRUD
router.get('/:quizId', QuizController.getQuizDetails);
router.post('/', QuizController.createQuiz);
router.put('/:quizId', QuizController.updateQuiz);
router.delete('/:quizId', QuizController.deleteQuiz);

// Questions
router.post('/:quizId/questions', QuizController.addQuestion);
router.put('/questions/:questionId', QuizController.updateQuestion);
router.delete('/questions/:questionId', QuizController.deleteQuestion);

// Rewards
router.get('/:quizId/rewards', QuizController.getRewards);
router.put('/:quizId/rewards', QuizController.updateRewards);

module.exports = router;
