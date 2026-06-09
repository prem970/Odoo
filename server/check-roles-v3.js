const { getDb } = require('./config/db');
require('dotenv').config();

async function checkRoles() {
    const db = getDb();
    try {
        const res = await db.query('SELECT * FROM roles');
        console.log('Roles from DB:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkRoles();
