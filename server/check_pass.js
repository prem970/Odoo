const { getDb } = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkPasswords() {
    const db = getDb();
    try {
        const res = await db.query("SELECT email, password_hash FROM users WHERE email = 'admin@odoo-clone.com'");
        if (res.rows.length === 0) {
            console.log('Admin user not found');
            return;
        }
        const user = res.rows[0];
        const isDefault = await bcrypt.compare('AdminPassword123!', user.password_hash);
        const isInstructor = await bcrypt.compare('Instructor@123', user.password_hash);

        console.log(`User: ${user.email}`);
        console.log(`Matches 'AdminPassword123!': ${isDefault}`);
        console.log(`Matches 'Instructor@123': ${isInstructor}`);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

checkPasswords();
