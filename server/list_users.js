const { getDb } = require('./config/db');
require('dotenv').config();

async function listUsers() {
    const db = getDb();
    try {
        const res = await db.query(`
            SELECT u.id, u.full_name, u.email, r.name as role 
            FROM users u
            JOIN roles r ON u.role_id = r.id
        `);
        console.log('USERS IN DATABASE:', JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error('Error listing users:', e);
    } finally {
        process.exit(0);
    }
}

listUsers();
