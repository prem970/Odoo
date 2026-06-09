const { getDb } = require('../config/db');

module.exports = {
    getStats: async (req, res) => {
        try {
            const db = getDb();

            // 1. Total Participants (Unique users in enrollments who are LEARNERS id=3)
            const totalParticipantsQuery = await db.query(`
                SELECT COUNT(DISTINCT e.user_id) as count 
                FROM enrollments e
                JOIN users u ON e.user_id = u.id
                WHERE u.role_id = 3
            `);
            const totalParticipants = parseInt(totalParticipantsQuery.rows[0].count);

            // 2. Course Progress Stats (Only for LEARNERS id=3)
            // Statuses: 'YET_TO_START', 'IN_PROGRESS', 'COMPLETED'
            const statsQuery = await db.query(`
                SELECT cp.status, COUNT(*) as count 
                FROM course_progress cp
                JOIN users u ON cp.user_id = u.id
                WHERE u.role_id = 3
                GROUP BY cp.status
            `);

            const stats = {
                totalParticipants,
                yetToStart: 0,
                inProgress: 0,
                completed: 0
            };

            statsQuery.rows.forEach(row => {
                if (row.status === 'YET_TO_START') stats.yetToStart = parseInt(row.count);
                if (row.status === 'IN_PROGRESS') stats.inProgress = parseInt(row.count);
                if (row.status === 'COMPLETED') stats.completed = parseInt(row.count);
            });

            res.json(stats);
        } catch (error) {
            console.error('ADMIN STATS ERROR:', error);
            res.status(500).json({ message: 'Error fetching admin stats' });
        }
    },

    getEnrollments: async (req, res) => {
        try {
            const db = getDb();
            // Fetch detailed list joining enrollments, users, courses, course_progress
            // Filter for only LEARNERS (role_id = 3)

            const queryWithSeconds = `
                SELECT 
                    e.user_id,
                    e.course_id,
                    u.full_name as participant_name,
                    c.title as course_name,
                    e.enrolled_at,
                    cp.started_at,
                    cp.completed_at,
                    cp.status,
                    cp.completion_percentage,
                    CASE 
                        WHEN cp.started_at IS NOT NULL AND cp.completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (cp.completed_at - cp.started_at))
                        WHEN cp.started_at IS NOT NULL THEN EXTRACT(EPOCH FROM (now() - cp.started_at))
                        ELSE 0
                    END as time_spent_seconds
                FROM enrollments e
                JOIN users u ON e.user_id = u.id
                JOIN courses c ON e.course_id = c.id
                LEFT JOIN course_progress cp ON e.user_id = cp.user_id AND e.course_id = cp.course_id
                WHERE u.role_id = 3
                ORDER BY e.enrolled_at DESC
            `;

            const resultSeconds = await db.query(queryWithSeconds);
            res.json(resultSeconds.rows);

        } catch (error) {
            console.error('ADMIN ENROLLMENTS ERROR:', error);
            res.status(500).json({ message: 'Error fetching enrollments' });
        }
    }
};
