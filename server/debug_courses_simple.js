const { getDb } = require('./config/db');
require('dotenv').config();

async function checkCourses() {
    const db = getDb();
    try {
        const courses = await db.query("SELECT id, title, course_admin, published FROM courses");
        console.log('COURSES:');
        courses.rows.forEach(r => console.log(JSON.stringify(r)));

        const users = await db.query("SELECT id, full_name, email FROM users");
        console.log('USERS:');
        users.rows.forEach(r => console.log(JSON.stringify(r)));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

checkCourses();
