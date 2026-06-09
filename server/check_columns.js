const { getDb } = require('./config/db');
require('dotenv').config();

async function listUsers() {
    const db = getDb();
    try {
        const res = await db.query(`
            SELECT u.id, u.full_name, u.email, u.role_id, r.name as role_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        `);
        console.log('Users:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

listUsers();
