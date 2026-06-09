const { getDb } = require('./config/db');
require('dotenv').config();

async function verifyQuery() {
    let pool;
    try {
        pool = getDb();
        console.log("Checking DB connection...");
        const userRes = await pool.query('SELECT id FROM users LIMIT 1');

        if (userRes.rows.length === 0) {
            console.log("No users found.");
            return;
        }

        const userId = userRes.rows[0].id;
        console.log(`Testing with User ID: ${userId}`);

        // Test Query 1: Lesson Progress
        try {
            console.log("Testing Lesson Progress query...");
            const q1 = `SELECT completed_at::date as activity_date FROM lesson_progress WHERE user_id = $1 AND completed = true LIMIT 1`;
            await pool.query(q1, [userId]);
            console.log("Query 1 SUCCESS");
        } catch (e) {
            console.error("Query 1 FAILED:", e.message);
        }

        // Test Query 2: Quiz Attempts
        try {
            console.log("Testing Quiz Attempts query...");
            const q2 = `SELECT attempted_at::date as activity_date FROM quiz_attempts WHERE user_id = $1 LIMIT 1`;
            await pool.query(q2, [userId]);
            console.log("Query 2 SUCCESS");
        } catch (e) {
            console.error("Query 2 FAILED:", e.message);
        }

        // Test Query 3: Full Heatmap Query
        console.log("Testing Full Heatmap query...");
        const query = `
            SELECT to_char(activity_date, 'YYYY-MM-DD') as date, COUNT(*)::int as count
            FROM (
                SELECT completed_at::date as activity_date FROM lesson_progress WHERE user_id = $1 AND completed = true
                UNION ALL
                SELECT attempted_at::date as activity_date FROM quiz_attempts WHERE user_id = $1
            ) as activities
            GROUP BY activity_date
            ORDER BY activity_date ASC
        `;
        const res = await pool.query(query, [userId]);
        console.log("Full Query SUCCESS. Rows:", res.rows.length);

    } catch (err) {
        console.error("Full Query FAILED:", err.message);
    } finally {
        if (pool) await pool.end();
        console.log("DONE");
    }
}

verifyQuery();
