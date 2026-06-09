
const { getDb } = require('./config/db');
require('dotenv').config();

async function reproCreateCourse() {
    try {
        const db = getDb();

        // 1. Get a user to act as admin
        const userRes = await db.query("SELECT id FROM users LIMIT 1");
        if (userRes.rows.length === 0) {
            console.error("No users found to test with.");
            process.exit(1);
        }
        const adminId = userRes.rows[0].id;
        console.log("Using user ID:", adminId);

        // 2. Simulate createCourse controller input
        const title = "Repro Course " + Date.now();
        const description = "Test description";
        const price = 0;
        const access_rule = "OPEN";

        console.log("Attempting to insert course...");

        // Same query as CourseController.js
        const result = await db.query(
            `INSERT INTO courses(title, description, price, access_rule, visibility, course_admin)
            VALUES($1, $2, $3, $4, $5, $6) RETURNING * `,
            [title, description, price || 0, access_rule || 'OPEN', 'EVERYONE', adminId]
        );

        console.log("Course created successfully:", result.rows[0]);
        process.exit(0);

    } catch (error) {
        console.error('CREATE COURSE REPRO ERROR:', error);
        process.exit(1);
    }
}

reproCreateCourse();
