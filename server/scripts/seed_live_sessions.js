const { getDb } = require('../config/db');
require('dotenv').config();

async function seed() {
    try {
        const db = getDb();

        const courseRes = await db.query('SELECT id FROM courses LIMIT 1');
        const instructorRes = await db.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name='INSTRUCTOR') LIMIT 1");

        if (courseRes.rows.length === 0) {
            console.log('No courses found. Create a course first.');
            return;
        }

        const courseId = courseRes.rows[0].id;
        const instructorId = instructorRes.rows[0]?.id || (await db.query('SELECT id FROM users LIMIT 1')).rows[0].id;

        console.log('Creating LIVE session...');
        await db.query(`
            INSERT INTO live_sessions (course_id, title, description, instructor_id, start_time, end_time, status, meeting_url)
            VALUES ($1, 'Live: Advanced Backend Patterns', 'Deep dive into microservices and event-driven architecture.', $2, now(), now() + interval '1 hour', 'LIVE', 'Odoo_Live_Demo_1')
        `, [courseId, instructorId]);

        console.log('Creating UPCOMING session...');
        await db.query(`
            INSERT INTO live_sessions (course_id, title, description, instructor_id, start_time, end_time, status)
            VALUES ($1, 'Q&A Session: Week 4', 'Open floor for questions regarding the latest module.', $2, now() + interval '1 day', now() + interval '1 day 1 hour', 'SCHEDULED')
        `, [courseId, instructorId]);

        console.log('Seeding complete!');
    } catch (err) {
        console.error(err);
    } finally {
        const pool = getDb();
        await pool.end();
    }
}

seed();
