const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getDb } = require('./config/db');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
    try {
        const db = getDb();
        const newPassword = 'Instructor@123';

        console.log(`Hashing password: ${newPassword}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log('Updating all users with new password hash...');
        const result = await db.query('UPDATE users SET password_hash = $1', [hashedPassword]);

        console.log(`✅ Successfully updated passwords for ${result.rowCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update passwords:', error);
        process.exit(1);
    }
}

updatePasswords();
