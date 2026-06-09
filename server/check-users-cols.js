const { getDb } = require('./config/db');
require('dotenv').config();

async function checkUsersTable() {
    const db = getDb();
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Users columns:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsersTable();
