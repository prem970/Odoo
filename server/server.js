const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { getDb } = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check - getDb() is called ONLY at runtime when a request hits this route
app.get('/api/health', async (req, res) => {
    try {
        const db = getDb();
        const result = await db.query('SELECT NOW()');
        res.json({
            status: 'ok',
            serverTime: result.rows[0].now,
            env: process.env.NODE_ENV || 'development'
        });
    } catch (err) {
        console.error('Database runtime check failed:', err.message);
        res.status(500).json({ status: 'error', message: 'Runtime DB connection failed' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Serve static assets from the React app in production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html'));
    });
}

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
