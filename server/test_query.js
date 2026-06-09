const { getDb } = require('./config/db');
require('dotenv').config({ path: './.env' });

async function testQuery() {
    const db = getDb();
    try {
        const courseId = 'b0792994-e847-495c-9c9e-561b365825bc'; // Example course ID
        const res = await db.query(`
            SELECT u.id, u.full_name, u.email, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name ILIKE 'learner'
            AND u.id NOT IN (
                SELECT user_id FROM enrollments WHERE course_id = $1
            )
            ORDER BY u.full_name ASC
        `, [courseId]);
        console.log('ELIGIBLE LEARNERS COUNT:', res.rows.length);
        console.log('SAMPLE:', JSON.stringify(res.rows.slice(0, 3), null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testQuery();
