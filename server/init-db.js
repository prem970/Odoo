require('dotenv').config();
const { getDb } = require('./config/db');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function initDb() {
    const db = getDb();
    try {
        console.log('--- Initializing LearnSphere Database ---');

        // 1. Ensure extensions
        await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

        // 2. Roles
        await db.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL
            );
        `);

        await db.query(`
            INSERT INTO roles(id, name)
            VALUES (1, 'ADMIN'), (2, 'INSTRUCTOR'), (3, 'LEARNER')
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
        `);

        // 3. Users
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role_id INT REFERENCES roles(id),
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 4. Courses
        await db.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                website TEXT,
                visibility TEXT CHECK (visibility IN ('EVERYONE','SIGNED_IN')),
                access_rule TEXT CHECK (access_rule IN ('OPEN','INVITE','PAYMENT')),
                price NUMERIC(10,2),
                published BOOLEAN DEFAULT FALSE,
                course_admin UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 5. Enrollments
        await db.query(`
            CREATE TABLE IF NOT EXISTS enrollments (
                user_id UUID REFERENCES users(id),
                course_id UUID REFERENCES courses(id),
                enrolled_at TIMESTAMP DEFAULT now(),
                invited BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (user_id, course_id)
            );
        `);

        // 6. Progress
        await db.query(`
            CREATE TABLE IF NOT EXISTS course_progress (
                user_id UUID,
                course_id UUID,
                completion_percentage NUMERIC(5,2) DEFAULT 0,
                status TEXT CHECK (status IN ('YET_TO_START','IN_PROGRESS','COMPLETED')),
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                PRIMARY KEY (user_id, course_id)
            );
        `);

        // 7. Messages (for Admin Dashboard)
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id UUID REFERENCES users(id),
                sender_name TEXT,
                content TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // Ensure columns exist for older DBs
        const ensureColumn = async (table, col, type) => {
            try { await db.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${type}`); } catch (e) { }
        };
        await ensureColumn('users', 'full_name', 'TEXT');
        await ensureColumn('users', 'password_hash', 'TEXT');
        await ensureColumn('users', 'google_id', 'TEXT');
        await ensureColumn('users', 'avatar', 'TEXT');
        await ensureColumn('users', 'provider', "TEXT DEFAULT 'google'");
        await ensureColumn('messages', 'sender_name', 'TEXT');

        console.log('✅ Database Schema Verified and Initialized');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Init Failed:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    initDb();
}

module.exports = { initDb };

