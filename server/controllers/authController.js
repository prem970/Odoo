const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const db = getDb();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Map role name to ID: 1=ADMIN, 2=INSTRUCTOR, 3=LEARNER
        const roleMap = {
            'ADMIN': 1,
            'INSTRUCTOR': 2,
            'LEARNER': 3
        };
        const roleName = (role || 'LEARNER').toUpperCase();
        const roleId = roleMap[roleName] || 3;

        // Insert User using cleaned schema
        const userResult = await db.query(
            'INSERT INTO users (full_name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashedPassword, roleId]
        );
        const userId = userResult.rows[0].id;

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('REGISTRATION ERROR:', error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const db = getDb();

        const result = await db.query(`
            SELECT u.id, u.full_name, u.email, u.password_hash, r.name as role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [email]);

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.full_name,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const googleAuthCallback = (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect("/login?error=oauth_failed");
        }

        const token = generateToken(user);

        // Environment-aware redirect
        // In development, redirect to the BACKEND port (current process)
        // to bypass the frontend dev server and test production assets.
        const port = process.env.PORT || 5000;
        const CLIENT_URL = process.env.NODE_ENV === "production"
            ? "https://odoo-app-elearning.up.railway.app"
            : `http://localhost:${port}`;

        console.log('Google Auth Callback: Redirecting to', CLIENT_URL);

        res.redirect(`${CLIENT_URL}/auth-success?token=${token}`);

    } catch (error) {
        console.error("Google OAuth Error:", error);
        res.redirect("/login?error=server_error");
    }
};

module.exports = { register, login, googleAuthCallback };
