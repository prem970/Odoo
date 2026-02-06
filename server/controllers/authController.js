const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const db = getDb();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashedPassword, role || 'user']
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
    } catch (error) {
        console.error('REGISTRATION ERROR:', error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = getDb();
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { register, login };
