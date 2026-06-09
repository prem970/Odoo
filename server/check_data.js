require('dotenv').config({ path: '../.env' });
const { getDb } = require('./config/db');

async function checkCourses() {
    try {
        const db = getDb();
        console.log("Checking courses and enrollments...");

        const coursesRes = await db.query('SELECT id, title, published FROM courses');
        console.log(`Found ${coursesRes.rows.length} courses:`);
        coursesRes.rows.forEach(c => console.log(`- [${c.id}] ${c.title} (Published: ${c.published})`));

        const usersRes = await db.query('SELECT id, email, role FROM users');
        console.log(`\nFound ${usersRes.rows.length} users:`);
        usersRes.rows.forEach(u => console.log(`- [${u.id}] ${u.email} (${u.role})`));

        const enrollRes = await db.query('SELECT user_id, course_id FROM enrollments');
        console.log(`\nFound ${enrollRes.rows.length} enrollments.`);
        enrollRes.rows.forEach(e => {
            const user = usersRes.rows.find(u => u.id === e.user_id);
            const course = coursesRes.rows.find(c => c.id === e.course_id);
            console.log(`- ${user ? user.email : e.user_id} -> ${course ? course.title : e.course_id}`);
        });

    } catch (err) {
        console.error("Error checking DB:", err);
    }
}

setTimeout(checkCourses, 1000);
