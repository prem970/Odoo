const { getDb } = require('./config/db');
require('dotenv').config({ path: './.env' });

async function checkSchema() {
    const db = getDb();
    try {
        const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enrollments'");
        console.log('ENROLLMENTS:', JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

checkSchema();
