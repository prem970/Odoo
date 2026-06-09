const { getDb } = require('../config/db');

module.exports = {
    // Fetches all quizzes for courses the user is enrolled in
    getMyQuizzes: async (req, res) => {
        try {
            const db = getDb();
            const userId = req.user.id;

            const query = `
                SELECT 
                    q.id, 
                    q.title, 
                    c.title as course_title,
                    c.id as course_id,
                    l.id as lesson_id,
                    qa.score,
                    qa.attempt_no,
                    qa.attempted_at
                FROM quizzes q
                JOIN courses c ON q.course_id = c.id
                JOIN enrollments e ON e.course_id = c.id
                LEFT JOIN lessons l ON l.content_url = q.id::text AND l.type = 'QUIZ'
                LEFT JOIN (
                    SELECT DISTINCT ON (quiz_id) * 
                    FROM quiz_attempts 
                    WHERE user_id = $1 
                    ORDER BY quiz_id, score DESC, attempted_at DESC
                ) qa ON qa.quiz_id = q.id
                WHERE e.user_id = $1 AND c.published = true
                ORDER BY qa.attempted_at DESC NULLS LAST
            `;

            const result = await db.query(query, [userId]);
            res.json(result.rows);
        } catch (error) {
            console.error('GET MY QUIZZES ERROR:', error);
            res.status(500).json({ message: 'Error fetching quizzes' });
        }
    },

    // Fetches quiz details including questions and options
    getQuizDetails: async (req, res) => {
        const { quizId } = req.params;
        try {
            const db = getDb();

            // 1. Get Quiz info
            const quizRes = await db.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
            if (quizRes.rows.length === 0) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            // 2. Get Questions
            const questionsRes = await db.query('SELECT * FROM quiz_questions WHERE quiz_id = $1', [quizId]);
            const questions = questionsRes.rows;

            // 3. Get Options for each question
            for (let question of questions) {
                const optionsRes = await db.query('SELECT * FROM quiz_options WHERE question_id = $1', [question.id]);
                question.options = optionsRes.rows;
            }

            res.json({
                ...quizRes.rows[0],
                questions
            });
        } catch (error) {
            console.error('FETCH QUIZ DETAILS ERROR:', error);
            res.status(500).json({ message: 'Error fetching quiz details' });
        }
    },

    createQuiz: async (req, res) => {
        const { title, course_id } = req.body;
        try {
            const db = getDb();
            const result = await db.query(
                `INSERT INTO quizzes (title, course_id) VALUES ($1, $2) RETURNING *`,
                [title, course_id]
            );

            // Initialize default rewards
            await db.query(
                `INSERT INTO quiz_rewards (quiz_id, first_try, second_try, third_try, fourth_plus) VALUES ($1, 10, 7, 5, 2)`,
                [result.rows[0].id]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('CREATE QUIZ ERROR:', error);
            res.status(500).json({ message: 'Error creating quiz' });
        }
    },

    updateQuiz: async (req, res) => {
        const { quizId } = req.params;
        const { title } = req.body;
        try {
            const db = getDb();
            const result = await db.query(
                `UPDATE quizzes SET title = $1 WHERE id = $2 RETURNING *`,
                [title, quizId]
            );
            if (result.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
            res.json(result.rows[0]);
        } catch (error) {
            console.error('UPDATE QUIZ ERROR:', error);
            res.status(500).json({ message: 'Error updating quiz' });
        }
    },

    deleteQuiz: async (req, res) => {
        const { quizId } = req.params;
        try {
            const db = getDb();
            // Cascading delete should handle relations, but let's be safe if no cascade
            await db.query('DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = $1)', [quizId]);
            await db.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [quizId]);
            await db.query('DELETE FROM quiz_rewards WHERE quiz_id = $1', [quizId]);
            await db.query('DELETE FROM quizzes WHERE id = $1', [quizId]);
            res.json({ message: 'Quiz deleted' });
        } catch (error) {
            console.error('DELETE QUIZ ERROR:', error);
            res.status(500).json({ message: 'Error deleting quiz' });
        }
    },

    addQuestion: async (req, res) => {
        const { quizId } = req.params;
        const { question, options } = req.body; // options is array of { text, is_correct }

        try {
            const db = getDb();
            // 1. Insert Question
            const qResult = await db.query(
                `INSERT INTO quiz_questions (quiz_id, question) VALUES ($1, $2) RETURNING *`,
                [quizId, question]
            );
            const newQuestion = qResult.rows[0];

            // 2. Insert Options
            if (options && options.length > 0) {
                for (let opt of options) {
                    await db.query(
                        `INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
                        [newQuestion.id, opt.option_text, opt.is_correct]
                    );
                }
            }

            // Return full question with options
            const optionsRes = await db.query('SELECT * FROM quiz_options WHERE question_id = $1', [newQuestion.id]);
            newQuestion.options = optionsRes.rows;

            res.status(201).json(newQuestion);
        } catch (error) {
            console.error('ADD QUESTION ERROR:', error);
            res.status(500).json({ message: 'Error adding question' });
        }
    },

    updateQuestion: async (req, res) => {
        const { questionId } = req.params;
        const { question, options } = req.body;

        try {
            const db = getDb();
            // 1. Update Question Text
            await db.query(`UPDATE quiz_questions SET question = $1 WHERE id = $2`, [question, questionId]);

            // 2. Update Options (Full replace strategy for simplicity)
            await db.query(`DELETE FROM quiz_options WHERE question_id = $1`, [questionId]);

            if (options && options.length > 0) {
                for (let opt of options) {
                    await db.query(
                        `INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
                        [questionId, opt.option_text, opt.is_correct]
                    );
                }
            }

            // Return updated
            const qRes = await db.query('SELECT * FROM quiz_questions WHERE id = $1', [questionId]);
            const optionsRes = await db.query('SELECT * FROM quiz_options WHERE question_id = $1', [questionId]);
            const updatedQuestion = qRes.rows[0];
            updatedQuestion.options = optionsRes.rows;

            res.json(updatedQuestion);

        } catch (error) {
            console.error('UPDATE QUESTION ERROR:', error);
            res.status(500).json({ message: 'Error updating question' });
        }
    },

    deleteQuestion: async (req, res) => {
        const { questionId } = req.params;
        try {
            const db = getDb();
            await db.query('DELETE FROM quiz_options WHERE question_id = $1', [questionId]);
            await db.query('DELETE FROM quiz_questions WHERE id = $1', [questionId]);
            res.json({ message: 'Question deleted' });
        } catch (error) {
            console.error('DELETE QUESTION ERROR:', error);
            res.status(500).json({ message: 'Error deleting question' });
        }
    },

    getRewards: async (req, res) => {
        const { quizId } = req.params;
        try {
            const db = getDb();
            const result = await db.query('SELECT * FROM quiz_rewards WHERE quiz_id = $1', [quizId]);
            if (result.rows.length === 0) {
                // Return defaults if not found
                return res.json({ first_try: 10, second_try: 7, third_try: 5, fourth_plus: 2 });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error('GET REWARDS ERROR:', error);
            res.status(500).json({ message: 'Error fetching rewards' });
        }
    },

    updateRewards: async (req, res) => {
        const { quizId } = req.params;
        const { first_try, second_try, third_try, fourth_plus } = req.body;
        try {
            const db = getDb();
            // Upsert logic
            const check = await db.query('SELECT 1 FROM quiz_rewards WHERE quiz_id = $1', [quizId]);
            let result;
            if (check.rows.length > 0) {
                result = await db.query(
                    `UPDATE quiz_rewards SET first_try=$1, second_try=$2, third_try=$3, fourth_plus=$4 WHERE quiz_id=$5 RETURNING *`,
                    [first_try, second_try, third_try, fourth_plus, quizId]
                );
            } else {
                result = await db.query(
                    `INSERT INTO quiz_rewards (quiz_id, first_try, second_try, third_try, fourth_plus) VALUES ($5, $1, $2, $3, $4) RETURNING *`,
                    [first_try, second_try, third_try, fourth_plus, quizId]
                );
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error('UPDATE REWARDS ERROR:', error);
            res.status(500).json({ message: 'Error updating rewards' });
        }
    },

    submitAttempt: async (req, res) => {
        const { quizId } = req.params;
        const { answers } = req.body; // e.g., { questionId: optionId, ... }
        const userId = req.user.id;

        try {
            const db = getDb();

            // 1. Calculate Score
            let score = 0;
            const questionsRes = await db.query('SELECT id FROM quiz_questions WHERE quiz_id = $1', [quizId]);
            const questions = questionsRes.rows;
            const totalQuestions = questions.length;

            if (totalQuestions === 0) {
                return res.status(400).json({ message: 'Quiz has no questions' });
            }

            for (const q of questions) {
                const userOptionId = answers[q.id];
                if (userOptionId) {
                    const correctRes = await db.query(
                        'SELECT is_correct FROM quiz_options WHERE id = $1 AND question_id = $2',
                        [userOptionId, q.id]
                    );
                    if (correctRes.rows.length > 0 && correctRes.rows[0].is_correct) {
                        score++;
                    }
                }
            }

            // Normalize score (e.g., to percentage or raw)
            // Stored procedure expects an integer score. Let's assume raw score or percentage?
            // "score INT" in table. Let's use percentage for now or raw?
            // Prompt says "Calculates score". 
            // Let's use raw score for now, but usually it's % for passing.
            // Wait, schema says "score INT".
            let correctCount = 0;
            const breakdown = [];
            for (const q of questions) {
                const userOptionId = answers[q.id];
                let isCorrect = false;
                if (userOptionId) {
                    const correctRes = await db.query(
                        'SELECT is_correct FROM quiz_options WHERE id = $1 AND question_id = $2',
                        [userOptionId, q.id]
                    );
                    if (correctRes.rows.length > 0 && correctRes.rows[0].is_correct) {
                        correctCount++;
                        isCorrect = true;
                    }
                }
                breakdown.push({
                    questionId: q.id,
                    isCorrect,
                    userOptionId
                });
            }

            const finalScore = Math.round((correctCount / totalQuestions) * 100);
            await db.query('CALL sp_submit_quiz_attempt($1, $2, $3)', [userId, quizId, finalScore]);

            if (finalScore >= 70) {
                const lessonRes = await db.query(
                    "SELECT id FROM lessons WHERE type = 'QUIZ' AND content_url = $1",
                    [quizId]
                );

                if (lessonRes.rows.length > 0) {
                    const lessonId = lessonRes.rows[0].id;
                    await db.query(`
                        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
                        VALUES ($1, $2, true, now())
                        ON CONFLICT (user_id, lesson_id) 
                        DO UPDATE SET completed = true, completed_at = now()
                    `, [userId, lessonId]);
                }
            }

            res.json({
                score: finalScore,
                passed: finalScore >= 70,
                totalQuestions,
                correctCount: correctCount,
                breakdown
            });

        } catch (error) {
            console.error('SUBMIT QUIZ ERROR:', error);
            res.status(500).json({ message: 'Error submitting quiz' });
        }
    }
};
