require('dotenv').config({ path: __dirname + '/../.env' });
const { getDb } = require('../config/db');

const quizzesData = [
    {
        courseTitle: 'Mastering React & Redux',
        title: 'React Fundamentals Quiz',
        questions: [
            {
                text: 'What is the Virtual DOM?',
                options: [
                    { text: 'A direct copy of the HTML DOM', correct: false },
                    { text: 'A lightweight JavaScript representation of the DOM', correct: true },
                    { text: 'A browser plugin for performance', correct: false },
                    { text: 'A database for React components', correct: false }
                ]
            },
            {
                text: 'Which hook is used for side effects?',
                options: [
                    { text: 'useState', correct: false },
                    { text: 'useEffect', correct: true },
                    { text: 'useContext', correct: false },
                    { text: 'useReducer', correct: false }
                ]
            }
        ]
    },
    {
        courseTitle: 'Python for Data Science',
        title: 'Python Basics Quiz',
        questions: [
            {
                text: 'Which library is best for data manipulation?',
                options: [
                    { text: 'NumPy', correct: false },
                    { text: 'Pandas', correct: true },
                    { text: 'Matplotlib', correct: false },
                    { text: 'Requests', correct: false }
                ]
            },
            {
                text: 'How do you define a function in Python?',
                options: [
                    { text: 'func myFunc():', correct: false },
                    { text: 'def myFunc():', correct: true },
                    { text: 'function myFunc():', correct: false },
                    { text: 'define myFunc():', correct: false }
                ]
            }
        ]
    },
    {
        courseTitle: 'UI/UX Design Fundamentals',
        title: 'Design Principles Quiz',
        questions: [
            {
                text: 'What does "Hierarchy" refer to in design?',
                options: [
                    { text: 'The use of royal colors', correct: false },
                    { text: 'Arranging elements to show importance', correct: true },
                    { text: 'Making everything the same size', correct: false },
                    { text: 'Using only one font', correct: false }
                ]
            }
        ]
    }
];

async function seedQuizzes() {
    try {
        const db = getDb();
        console.log('Seeding Quizzes...');

        for (const qData of quizzesData) {
            // 1. Find Course
            const courseRes = await db.query('SELECT id FROM courses WHERE title = $1', [qData.courseTitle]);
            if (courseRes.rows.length === 0) {
                console.log(`Skipping ${qData.courseTitle} (Course not found)`);
                continue;
            }
            const courseId = courseRes.rows[0].id;

            const existQuiz = await db.query('SELECT id FROM quizzes WHERE title = $1 AND course_id = $2', [qData.title, courseId]);
            let quizId;

            if (existQuiz.rows.length > 0) {
                quizId = existQuiz.rows[0].id;
                console.log(`Quiz exists: ${qData.title}`);
            } else {
                const quizInsert = await db.query(
                    'INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING id',
                    [courseId, qData.title]
                );
                quizId = quizInsert.rows[0].id;
                console.log(`Created Quiz: ${qData.title}`);

                for (const q of qData.questions) {
                    const qInsert = await db.query(
                        'INSERT INTO quiz_questions (quiz_id, question) VALUES ($1, $2) RETURNING id',
                        [quizId, q.text]
                    );
                    const questionId = qInsert.rows[0].id;

                    for (const opt of q.options) {
                        await db.query(
                            'INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
                            [questionId, opt.text, opt.correct]
                        );
                    }
                }
            }

            const lessonExist = await db.query(
                "SELECT id FROM lessons WHERE course_id = $1 AND type = 'QUIZ' AND content_url = $2",
                [courseId, quizId]
            );

            if (lessonExist.rows.length === 0) {
                const orderRes = await db.query('SELECT MAX(lesson_order) as max_order FROM lessons WHERE course_id = $1', [courseId]);
                const nextOrder = (orderRes.rows[0].max_order || 0) + 1;

                await db.query(
                    "INSERT INTO lessons (course_id, title, type, content_url, duration, lesson_order) VALUES ($1, $2, 'QUIZ', $3, 15, $4)",
                    [courseId, qData.title, quizId, nextOrder]
                );
                console.log(`Created Lesson for Quiz: ${qData.title}`);
            } else {
                console.log(`Lesson for Quiz already exists.`);
            }
        }

        console.log('Quiz seeding complete!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedQuizzes();
