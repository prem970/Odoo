const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getDb } = require('./config/db');

async function checkLessons() {
    try {
        const db = getDb();
        const courseTitles = ['Mastering React & Redux', 'UI/UX Design Fundamentals'];

        const result = await db.query(`
            SELECT c.title, COUNT(l.id) as lesson_count, COALESCE(SUM(l.duration), 0) as total_duration
            FROM courses c
            LEFT JOIN lessons l ON c.id = l.course_id
            WHERE c.title = ANY($1)
            GROUP BY c.id, c.title
        `, [courseTitles]);

        console.table(result.rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkLessons();
