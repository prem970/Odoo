
const { getDb } = require('./config/db');
require('dotenv').config();

async function checkRoles() {
    try {
        const db = getDb();
        const res = await db.query("SELECT * FROM roles");
        console.log("Roles:", res.rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
checkRoles();
