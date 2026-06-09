require('dotenv').config({ path: __dirname + '/../.env' });
const { getDb } = require('../config/db');

async function seedFeatures() {
    try {
        const db = getDb();
        console.log("Seeding Assignments and Live Sessions...");

        const courseRes = await db.query('SELECT id FROM courses LIMIT 1');
        const userRes = await db.query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'ADMIN') LIMIT 1");

        if (courseRes.rows.length === 0 || userRes.rows.length === 0) {
            console.log("Need courses and users to seed features.");
            return;
        }

        const courseId = courseRes.rows[0].id;
        const adminId = userRes.rows[0].id;

        const assignments = [
            { title: 'React Basics Project', desc: 'Build a simple todo app.', days: 7 },
            { title: 'Data Cleaning Lab', desc: 'Process the titanic dataset.', days: 3 }
        ];

        for (const a of assignments) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + a.days);

            await db.query(`
                INSERT INTO assignments (course_id, title, description, due_date, max_points)
                VALUES ($1, $2, $3, $4, 100)
                ON CONFLICT DO NOTHING
            `, [courseId, a.title, a.desc, dueDate]);
            console.log(`Created assignment: ${a.title}`);
        }

        const liveDate = new Date();
        liveDate.setHours(liveDate.getHours() + 24);

        await db.query(`
            INSERT INTO live_sessions (course_id, instructor_id, title, description, start_time, end_time, meeting_url, status)
            VALUES ($1, $2, 'Q&A Session', 'Ask anything about the course.', $3, $4, 'https://zoom.us/j/123456', 'SCHEDULED')
            ON CONFLICT DO NOTHING
        `, [courseId, adminId, liveDate, new Date(liveDate.getTime() + 3600000)]);

        console.log("Created live session.");

        console.log("Feature seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seedFeatures();
