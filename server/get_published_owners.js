const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getDb } = require('./config/db');

async function getPublishedOwners() {
    try {
        const db = getDb();
        const result = await db.query(`
            SELECT c.title, u.full_name as owner_name, u.email 
            FROM courses c 
            JOIN users u ON c.course_admin = u.id 
            WHERE c.published = true
        `);

        console.log('--- Published Courses & Owners ---');
        console.table(result.rows);

        process.exit(0);
    } catch (error) {
        console.error('Query Failed:', error);
        process.exit(1);
    }
}

// Ensure DB connection is established before querying (getDb lazy loads)
// We might need to wait a tick or just call it. createPool happens synchronously.
getPublishedOwners();
