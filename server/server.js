const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messageRoutes');
const { getDb } = require('./config/db');
const passport = require('./config/passport');

const app = express();
app.enable('trust proxy'); // Required for Railway/Heroku/Vercel (behind proxy)

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// OAuth Routes
app.use('/auth', googleAuthRoutes);

// Basic health check (no DB dependency)
app.get('/api/health-simple', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Detailed health check - Checks connection and tables
app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    let dbError = null;
    let tables = { users: false, messages: false };
    try {
        const db = getDb();
        await db.query('SELECT 1');
        dbStatus = 'connected';

        const userTable = await db.query("SELECT to_regclass('public.users') as exists");
        const msgTable = await db.query("SELECT to_regclass('public.messages') as exists");

        tables.users = !!userTable.rows[0].exists;
        tables.messages = !!msgTable.rows[0].exists;
    } catch (err) {
        dbStatus = 'error';
        dbError = err.message;
        console.error('Database health check failed:', err.message);
    }
    res.status(200).json({
        status: 'ok',
        database: dbStatus,
        error: dbError,
        tables: tables,
        env: process.env.NODE_ENV
    });
});

app.get('/debug-dist', (req, res) => {
    const fs = require('fs');
    try {
        const files = fs.readdirSync(buildPath);
        const assets = fs.existsSync(path.join(buildPath, 'assets')) ? fs.readdirSync(path.join(buildPath, 'assets')) : 'missing';
        res.json({ buildPath, exists: fs.existsSync(buildPath), files, assets });
    } catch (err) {
        res.status(500).json({ error: err.message, buildPath });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Merged Routes from valid branches
app.use('/api/learner', require('./routes/learnerRoutes'));
app.use('/api/ai', require('./routes/chatRoutes'));
app.use('/api/live-classes', require('./routes/liveClassRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));

// Initialize Certificate Table (Self-healing)
const CertificateModel = require('./models/certificateModel');
CertificateModel.createCertificateTable();

// Serve static assets from the React app
const buildPath = path.join(__dirname, '../client/dist');
console.log('Static Build Path:', buildPath);
const fs = require('fs');
console.log('Build Path Exists:', fs.existsSync(buildPath));

app.use(express.static(buildPath));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Handle EADDRINUSE error
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use. Please close the other application or change the port.`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
});
