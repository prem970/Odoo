require('dotenv').config();
const { getDb } = require('./config/db');

async function initDb() {
    const db = getDb();
    try {
        console.log('--- Initializing Database ---');

        // Only drop tables if explicitly requested (useful for force-resets)
        if (process.env.RESET_DB === 'true') {
            console.log('🗑️ Force Reset: Cleaning old schema...');
            await db.query('DROP TABLE IF EXISTS messages CASCADE');
            await db.query('DROP TABLE IF EXISTS users CASCADE');
        }

        // Create Users Table with TEXT types
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password_hash TEXT,
                role TEXT DEFAULT 'user',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP::TEXT
            );
        `);

        // Ensure columns are updated to TEXT if the table already existed (for existing DBs)
        await db.query(`
            ALTER TABLE users ALTER COLUMN name TYPE TEXT;
            ALTER TABLE users ALTER COLUMN email TYPE TEXT;
            ALTER TABLE users ALTER COLUMN password_hash TYPE TEXT;
            ALTER TABLE users ALTER COLUMN role TYPE TEXT;
        `);

        // Create Messages Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER REFERENCES users(id),
                content TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP::TEXT
            );
        `);

        console.log('✅ Database Schema Verified (All TEXT)');

        console.log('--- Database Initialization Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Init Failed:', err.message);
        process.exit(1);
    }
}

initDb();
