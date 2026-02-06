const { getDb } = require('./config/db');

async function initDb() {
    const db = getDb();
    try {
        console.log('--- Initializing Database ---');

        // Create or Update Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Explicitly fix columns if they were created with wrong types/lengths previously
        await db.query(`
            ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20);
            ALTER TABLE users ALTER COLUMN password_hash TYPE TEXT;
            ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(150);
            ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(100);
        `);
        console.log('✅ Users table schema verified/updated');

        // Create Messages Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER REFERENCES users(id),
                content TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Messages table ready');

        console.log('--- Database Initialization Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Init Failed:', err.message);
        process.exit(1);
    }
}

initDb();
