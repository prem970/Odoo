
require('dotenv').config(); // Load env vars first
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { getDb } = require('./config/db');

const createAdmin = async () => {
    try {
        console.log('Connecting to DB...');
        // Ensure DB_PASSWORD is set if using local config
        if (!process.env.DB_PASSWORD && !process.env.DATABASE_URL) {
            console.error('DB_PASSWORD or DATABASE_URL is missing in .env');
            // Hardcode for this script if needed, or let getDb fail
        }

        const db = getDb();

        // Wait for connection to be established or error
        await new Promise(resolve => setTimeout(resolve, 1000));

        const password = 'AdminPassword123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Checking for existing admin...');
        const check = await db.query('SELECT * FROM users WHERE email = $1', ['admin@odoo-clone.com']);

        if (check.rows.length > 0) {
            console.log('Admin user already exists.');
            console.log('User ID:', check.rows[0].id);
            console.log('Email:', check.rows[0].email);
            console.log('Password: (Existing password unchanged)');
            process.exit(0);
            return;
        }

        console.log('Creating new admin...');
        const res = await db.query(
            `INSERT INTO users (full_name, email, password_hash, role_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, full_name`,
            ['System Admin', 'admin@odoo-clone.com', hashedPassword, 1]
        );

        console.log('Admin User Created Successfully:');
        console.log('User ID:', res.rows[0].id);
        console.log('Email:', res.rows[0].email);
        console.log('Password:', password);

        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
