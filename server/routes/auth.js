const express = require('express');
const router = express.Router();
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/authController');

// @route   GET /auth/google
// @desc    Initiate Google OAuth
router.get('/google', (req, res, next) => {
    console.log('Initiating Google OAuth...');
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /auth/google/callback
// @desc    Google OAuth Callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
    googleAuthCallback
);

module.exports = router;
