const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getDb } = require('./config/db');

async function updateOwners() {
    try {
        const db = getDb();

        // 1. Get User ID for 'Ramasamy T' (using ILIKE for case-insensitive match)
        const userRes = await db.query("SELECT id, full_name FROM users WHERE full_name ILIKE 'Ramasamy T'");
        if (userRes.rows.length === 0) {
            console.error("User 'Ramasamy T' not found.");
            process.exit(1);
        }
        const newOwnerId = userRes.rows[0].id;
        console.log(`Found Target User: ${userRes.rows[0].full_name} (${newOwnerId})`);

        // 2. Update Courses
        const courseTitles = ['Mastering React & Redux', 'UI/UX Design Fundamentals'];

        const updateRes = await db.query(`
            UPDATE courses 
            SET course_admin = $1 
            WHERE title = ANY($2)
            RETURNING id, title, course_admin;
        `, [newOwnerId, courseTitles]);

        console.log(`\nSuccessfully updated ${updateRes.rowCount} courses:`);
        console.table(updateRes.rows);

        process.exit(0);

    } catch (error) {
        console.error('Update Failed:', error);
        process.exit(1);
    }
}

updateOwners();
