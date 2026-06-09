require('dotenv').config({ path: __dirname + '/../.env' }); // Adjust if run from 'scripts/' folder
const { getDb } = require('../config/db');

async function checkLessons() {
    try {
        const db = getDb();
        console.log("Checking lessons content_id...");

        const lessons = await db.query('SELECT title, content_url FROM lessons LIMIT 5');
        console.log(`Found ${lessons.rows.length} sample lessons:`);
        lessons.rows.forEach(l => console.log(`- ${l.title}: ${l.content_url}`));

        process.exit(0);

    } catch (err) {
        console.error("Error checking DB:", err);
        process.exit(1);
    }
}

checkLessons();
