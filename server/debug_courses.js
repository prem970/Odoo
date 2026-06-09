const { getDb } = require('./config/db');
require('dotenv').config();

async function checkCourses() {
    const db = getDb();
    try {
        const schema = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses'");
        console.log('COURSES Table Schema:', JSON.stringify(schema.rows, null, 2));

        const courses = await db.query("SELECT id, title, course_admin, published FROM courses");
        console.log('COURSES Content:', JSON.stringify(courses.rows, null, 2));

        const users = await db.query("SELECT id, full_name, email FROM users");
        console.log('USERS Content:', JSON.stringify(users.rows, null, 2));
    } catch (e) {
        console.error('Error checking courses:', e);
    } finally {
        process.exit(0);
    }
}

checkCourses();
