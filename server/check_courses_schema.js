const { getDb } = require('./config/db');
require('dotenv').config();

async function checkCoursesSchema() {
    const db = getDb();
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'courses'
        `);
        console.log('Courses Table Schema:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkCoursesSchema();
