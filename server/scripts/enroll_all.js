require('dotenv').config({ path: __dirname + '/../.env' });
const { getDb } = require('../config/db');

async function enrollAll() {
    try {
        const db = getDb();
        console.log("Enrolling all users in all published courses...");

        const courses = await db.query('SELECT id, title FROM courses WHERE published = true');
        if (courses.rows.length === 0) {
            console.log("No published courses found.");
            return;
        }

        const users = await db.query("SELECT id, email FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'LEARNER') OR role_id IS NULL");

        for (const user of users.rows) {
            for (const course of courses.rows) {
                const check = await db.query('SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2', [user.id, course.id]);
                if (check.rows.length === 0) {
                    await db.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [user.id, course.id]);
                    console.log(`Enrolled ${user.email} -> ${course.title}`);
                } else {
                    console.log(`Skipped ${user.email} -> ${course.title} (Already enrolled)`);
                }
            }
        }
        console.log("Enrollment complete!");
    } catch (err) {
        console.error("Enrollment error:", err);
    }
}

enrollAll();
