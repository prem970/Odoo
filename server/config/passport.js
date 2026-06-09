const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getDb } = require('./db');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = (process.env.NODE_ENV === 'production')
        ? "https://odoo-app-elearning.up.railway.app/auth/google/callback"
        : "/auth/google/callback";

    console.log('Google OAuth Callback URL:', callbackURL);

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        proxy: true // Required for Railway/HTTPS
    },
        async (accessToken, refreshToken, profile, done) => {
            const db = getDb();
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const googleId = profile.id;
            const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            const fullName = profile.displayName;

            if (!email) {
                return done(new Error("Google account does not have an email associated."));
            }

            try {
                // 1. Check if user already exists with this google_id
                let result = await db.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.google_id = $1', [googleId]);

                if (result.rows.length > 0) {
                    return done(null, result.rows[0]);
                }

                // 2. Check if user exists with this email (Link account logic)
                result = await db.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1', [email]);

                if (result.rows.length > 0) {
                    // Link google_id and avatar to existing email account
                    const updatedUser = await db.query(
                        'UPDATE users SET google_id = $1, avatar = $2, provider = $3 WHERE email = $4 RETURNING id, full_name, email, role_id',
                        [googleId, avatar, 'google', email]
                    );
                    // Regrab the user with role name
                    const finalUser = await db.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [updatedUser.rows[0].id]);
                    return done(null, finalUser.rows[0]);
                }

                // 3. Create new user if neither google_id nor email matches
                // Default to LEARNER role (id: 3)
                const newUser = await db.query(
                    'INSERT INTO users (full_name, email, google_id, avatar, provider, role_id, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                    [fullName, email, googleId, avatar, 'google', 3, 'OAUTH_USER']
                );

                const finalNewUser = await db.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [newUser.rows[0].id]);
                return done(null, finalNewUser.rows[0]);

            } catch (err) {
                console.error('Passport Google Strategy Error:', err);
                return done(err);
            }
        }
    ));
}

// No sessions used since we use JWT, but Passport requires these or we disable it
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));

module.exports = passport;
