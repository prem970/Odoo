require('dotenv').config({ path: './.env' });
const { getDb } = require('../config/db');

async function fixQuizzes() {
    try {
        const db = getDb();
        console.log('Fixing Quiz-to-Lesson mapping...');

        // Find quizzes that don't have a lesson
        const orphans = await db.query(`
            SELECT q.id, q.title, q.course_id
            FROM quizzes q
            LEFT JOIN lessons l ON l.content_url = q.id::text AND l.type = 'QUIZ'
            WHERE l.id IS NULL
        `);

        console.log(`Found ${orphans.rows.length} quizzes without associated lessons.`);

        for (const quiz of orphans.rows) {
            const orderRes = await db.query('SELECT MAX(lesson_order) as max_order FROM lessons WHERE course_id = $1', [quiz.course_id]);
            const nextOrder = (orderRes.rows[0].max_order || 0) + 1;

            await db.query(`
                INSERT INTO lessons (course_id, title, type, content_url, duration, lesson_order)
                VALUES ($1, $2, 'QUIZ', $3, 15, $4)
            `, [quiz.course_id, quiz.title, quiz.id, nextOrder]);

            console.log(`Created lesson for quiz: ${quiz.title}`);
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixQuizzes();
