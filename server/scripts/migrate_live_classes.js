const { getDb } = require('../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
    console.log('Starting Live Classes migration...');
    try {
        const db = getDb();
        const schemaPath = path.join(__dirname, '../models/live_class_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await db.query(schema);
        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        const pool = getDb();
        await pool.end();
    }
}

migrate();
