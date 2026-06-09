const { getDb } = require('./config/db');
require('dotenv').config();

async function checkCols() {
    let pool;
    try {
        pool = getDb();
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'lesson_progress'
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        if (pool) await pool.end();
    }
}
checkCols();
