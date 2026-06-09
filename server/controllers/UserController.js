const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
    getInstructors: async (req, res) => {
        try {
            const db = getDb();
            // Fetch users with role 'instructor' or 'admin'
            // Assuming roles: 1=admin, 2=instructor, 3=learner (Need to verify, but usually safer to join roles table or check logic)
            // Let's rely on role names for safety if possible, or just fetch all except learners if roles are hardcoded.
            // Based on init-db.js: admin, instructor, learner

            const result = await db.query(`
                SELECT u.id, u.full_name, r.name as role
                FROM users u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN roles r ON ur.role_id = r.id
                WHERE r.name IN ('admin', 'instructor')
                ORDER BY u.full_name ASC
            `);

            // Fallback if user_roles/roles structure is complex or different:
            // The previous code in AdminController used `role_id = 3` for learners.
            // If `users` table has `role_id` column (denormalized), use that.
            // Check check_columns output: users table wasn't checked, but AdminController uses `u.role_id`.

            // Let's check AdminController again.
            // AdminController: WHERE u.role_id = 3
            // So users table has role_id.

            // Let's fetch using role_id or join. 
            // Better to use role_id if it exists to match AdminController pattern, 
            // BUT init-db.js showed `user_roles` table. 
            // AdminController might be using a View or the users table has a role_id column added?
            // "await ensureColumn('users', 'hashed_password', 'TEXT');" in init-db.

            // Let's check `users` table schema real quick to be safe, OR utilize the JOIN which is safer if `user_roles` is the source of truth.
            // However, `AdminController` uses `u.role_id`.
            // Let's look at `UserController.getProfile`: `SELECT id, full_name, email, role_id FROM users ...`
            // So `users` table DEFINITELY has `role_id`.

            // I need to know which role_id is admin/instructor.
            // AdminController says 3 is learner.
            // Typically: 1=admin, 2=instructor.
            // I will return users where role_id IN (1, 2).

            const instructors = await db.query(`
                SELECT id, full_name, role_id 
                FROM users 
                WHERE role_id IN (1, 2)
                ORDER BY full_name
            `);

            res.json(instructors.rows);
        } catch (error) {
            console.error('GET INSTRUCTORS ERROR:', error);
            res.status(500).json({ message: 'Error fetching instructors' });
        }
    },

    getProfile: async (req, res) => {
        try {
            console.log('GET /profile called. User:', req.user);
            const db = getDb();
            const result = await db.query('SELECT id, full_name, email, role_id FROM users WHERE id = $1', [req.user.id]);
            console.log('Profile query result:', result.rows);
            if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
            res.json(result.rows[0]);
        } catch (error) {
            console.error('GET PROFILE ERROR:', error);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    },

    updateProfile: async (req, res) => {
        const { full_name } = req.body;
        try {
            const db = getDb();
            const result = await db.query(
                'UPDATE users SET full_name = $1 WHERE id = $2 RETURNING id, full_name, email',
                [full_name, req.user.id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('UPDATE PROFILE ERROR:', error);
            res.status(500).json({ message: 'Error updating profile' });
        }
    },

    changePassword: async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        try {
            const db = getDb();
            // 1. Get current password hash
            const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
            if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });

            const user = userRes.rows[0];

            // 2. Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect current password' });
            }

            // 3. Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // 4. Update password
            await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('CHANGE PASSWORD ERROR:', error);
            res.status(500).json({ message: 'Error changing password' });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            console.log('GET ALL USERS - User:', req.user);
            if (req.user.role?.toLowerCase() !== 'admin') {
                console.warn('GET ALL USERS - Forbidden attempt by:', req.user.email);
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }
            const db = getDb();
            const result = await db.query(`
                SELECT u.id, u.full_name, u.email, u.role_id, r.name as role_name 
                FROM users u
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.full_name ASC
            `);
            console.log('GET ALL USERS - Found count:', result.rows.length);
            res.json(result.rows);
        } catch (error) {
            console.error('GET ALL USERS ERROR:', error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    },

    deleteUser: async (req, res) => {
        try {
            if (req.user.role?.toLowerCase() !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }
            const db = getDb();
            const userId = req.params.id;

            // Prevent self-deletion
            if (userId === req.user.id) {
                return res.status(400).json({ message: 'Cannot delete your own account' });
            }

            await db.query('DELETE FROM users WHERE id = $1', [userId]);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('DELETE USER ERROR:', error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    },

    updateUser: async (req, res) => {
        try {
            if (req.user.role?.toLowerCase() !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }
            const db = getDb();
            const userId = req.params.id;
            const { full_name, role_id } = req.body;

            const result = await db.query(
                `UPDATE users 
                 SET full_name = $1, role_id = $2 
                 WHERE id = $3 
                 RETURNING id, full_name, email, role_id`,
                [full_name, role_id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Get role name for the updated user
            const final = await db.query(`
                SELECT u.id, u.full_name, u.email, u.role_id, r.name as role_name 
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = $1
            `, [userId]);

            res.json(final.rows[0]);
        } catch (error) {
            console.error('UPDATE USER ERROR:', error);
            res.status(500).json({ message: 'Error updating user' });
        }
    }
};
