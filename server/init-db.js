require('dotenv').config();
const { getDb } = require('./config/db');

async function initDb() {
    const db = getDb();
    try {
        console.log('--- Initializing Database ---');

        // Force reset only if explicitly requested
        if (process.env.RESET_DB === 'true') {
            console.log('🗑️ Force Reset: Cleaning old schema...');
            await db.query('DROP TABLE IF EXISTS messages CASCADE');
            await db.query('DROP TABLE IF EXISTS users CASCADE');
        }

        // 1. Create Users Table IF NOT EXISTS
        // We use TEXT for everything to avoid length issues, but we don't force ALTER if it exists.
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
        console.log('✅ Users table check complete');

        // 2. Create Messages Table IF NOT EXISTS
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER REFERENCES users(id),
                content TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP::TEXT
            );
        `);
        console.log('✅ Messages table check complete');

        // 3. Optional: Sync required columns safely (Only if missing and table is already there)
        // We do this via separate try-catch blocks to prevent script failure
        const ensureColumn = async (table, column, type) => {
            try {
                await db.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`);
            } catch (e) {
                // Ignore errors if the user has custom schema
                console.log(`ℹ️ Note: Could not ensure ${column} in ${table} (User might have a custom schema)`);
            }
        };

        await ensureColumn('users', 'name', 'TEXT');
        await ensureColumn('users', 'email', 'TEXT');
        await ensureColumn('users', 'password_hash', 'TEXT');
        await ensureColumn('users', 'role', 'TEXT');

        console.log('✅ Database Schema Verified (Passive Mode)');
        console.log('--- Database Initialization Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Init Failed:', err.message);
        process.exit(1);
    }
}

initDb();
