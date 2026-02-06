const { getDb } = require('./config/db');

async function initDb() {
    const db = getDb();
    try {
        console.log('--- Initializing Database ---');

        // Create or Update Users Table
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

        // Explicitly convert all columns to TEXT and fix defaults
        await db.query(`
            ALTER TABLE users ALTER COLUMN name TYPE TEXT;
            ALTER TABLE users ALTER COLUMN email TYPE TEXT;
            ALTER TABLE users ALTER COLUMN password_hash TYPE TEXT;
            ALTER TABLE users ALTER COLUMN role TYPE TEXT;
            ALTER TABLE users ALTER COLUMN created_at TYPE TEXT;
            ALTER TABLE users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP::TEXT;
            ALTER TABLE users ALTER COLUMN created_at DROP NOT NULL;
        `);
        console.log('✅ Users table schema updated to TEXT');

        // Create or Update Messages Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER REFERENCES users(id),
                content TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP::TEXT
            );
        `);

        await db.query(`
            ALTER TABLE messages ALTER COLUMN content TYPE TEXT;
            ALTER TABLE messages ALTER COLUMN status TYPE TEXT;
            ALTER TABLE messages ALTER COLUMN created_at TYPE TEXT;
            ALTER TABLE messages ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP::TEXT;
            ALTER TABLE messages ALTER COLUMN created_at DROP NOT NULL;
        `);
        console.log('✅ Messages table schema updated to TEXT');

        console.log('--- Database Initialization Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Init Failed:', err.message);
        process.exit(1);
    }
}

initDb();
