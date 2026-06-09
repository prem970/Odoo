const { getDb } = require('./config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPasswords() {
    const db = getDb();
    const newPassword = 'password123';

    try {
        console.log('Generating salt...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`Resetting passwords for admin@learnsphere.com and instructor@learnsphere.com to '${newPassword}'...`);

        // Update Admin
        const resAdmin = await db.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email',
            [hashedPassword, 'admin@learnsphere.com']
        );

        if (resAdmin.rowCount > 0) {
            console.log('✅ Admin password reset successfully.');
        } else {
            console.log('⚠️ Admin user not found.');
        }

        // Update Instructor
        const resInstr = await db.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email',
            [hashedPassword, 'instructor@learnsphere.com']
        );

        if (resInstr.rowCount > 0) {
            console.log('✅ Instructor password reset successfully.');
        } else {
            console.log('⚠️ Instructor user not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting passwords:', err);
        process.exit(1);
    }
}

resetPasswords();
