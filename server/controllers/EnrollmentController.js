const { getDb } = require('../config/db');

module.exports = {
    inviteAttendee: (req, res) => { },
    contactAttendees: (req, res) => { },
    // Self-enroll in a course
    enroll: async (req, res) => {
        const { courseId } = req.body;
        const userId = req.user.id;
        try {
            const db = getDb();
            // 1. Check if course exists and is published
            const courseRes = await db.query('SELECT published FROM courses WHERE id = $1', [courseId]);
            if (courseRes.rows.length === 0) {
                return res.status(404).json({ message: 'Course not found' });
            }
            if (!courseRes.rows[0].published) {
                return res.status(403).json({ message: 'Course is not currently available for enrollment' });
            }

            // 2. Check if already enrolled
            const check = await db.query('SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
            if (check.rows.length > 0) {
                return res.status(400).json({ message: 'Already enrolled' });
            }

            await db.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);
            res.status(201).json({ message: 'Enrolled successfully' });
        } catch (error) {
            console.error('ENROLL ERROR:', error);
            res.status(500).json({ message: 'Error enrolling in course' });
        }
    },

    joinCourse: (req, res) => { },

    getUserEnrollments: async (req, res) => {
        try {
            const db = getDb();
            const userId = req.user.id;

            const query = `
                SELECT 
                    c.id, 
                    c.title, 
                    c.image_url, 
                    c.description, 
                    COALESCE(cp.completion_percentage, 0) as completion_percentage,
                    COALESCE(cp.status, 'YET_TO_START') as status,
                    cp.completed_at
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                LEFT JOIN course_progress cp ON cp.course_id = c.id AND cp.user_id = e.user_id
                WHERE e.user_id = $1 AND c.published = true
            `;

            const result = await db.query(query, [userId]);
            res.json(result.rows);
        } catch (error) {
            console.error('GET ENROLLMENTS ERROR:', error);
            res.status(500).json({ message: 'Error fetching enrollments' });
        }
    },

    getLearnerProfile: async (req, res) => {
        try {
            const db = getDb();
            const userId = req.user.id;

            const pointsRes = await db.query(
                `SELECT COALESCE(SUM(points), 0) as total_points FROM points_log WHERE user_id = $1`,
                [userId]
            );
            const totalPoints = parseInt(pointsRes.rows[0].total_points);

            const badgesRes = await db.query(`SELECT * FROM badges ORDER BY min_points ASC`);
            const badges = badgesRes.rows;

            let currentBadge = badges.length > 0 ? badges[0] : { name: 'Novice', min_points: 0 };
            let nextBadge = badges.length > 0 ? badges[1] || null : null;

            for (let i = badges.length - 1; i >= 0; i--) {
                if (totalPoints >= badges[i].min_points) {
                    currentBadge = badges[i];
                    nextBadge = badges[i + 1] || null;
                    break;
                }
            }

            if (badges.length > 0 && totalPoints < badges[0].min_points) {
                currentBadge = { name: 'Novice', min_points: 0 };
                nextBadge = badges[0];
            }

            let progress = 100;
            if (nextBadge && nextBadge.min_points !== currentBadge.min_points) {
                const range = nextBadge.min_points - currentBadge.min_points;
                const earned = totalPoints - currentBadge.min_points;
                progress = Math.round((earned / range) * 100);
            }

            let activityLog = [];
            try {
                const activityRes = await db.query(`
                    SELECT to_char(activity_date, 'YYYY-MM-DD') as date, COUNT(*)::int as count
                    FROM (
                        SELECT completed_at::date as activity_date FROM lesson_progress WHERE user_id = $1 AND completed = true
                        UNION ALL
                        SELECT attempted_at::date as activity_date FROM quiz_attempts WHERE user_id = $1
                    ) as activities
                    GROUP BY activity_date
                    ORDER BY activity_date ASC
                `, [userId]);
                activityLog = activityRes.rows;
            } catch (err) {
                console.error('Heatmap Data Error (Ignored):', err.message);
            }

            const userRes = await db.query('SELECT full_name, email, created_at FROM users WHERE id = $1', [userId]);
            const user = userRes.rows[0];

            res.json({
                user,
                totalPoints,
                currentBadge,
                nextBadge,
                progress,
                badges,
                activityLog
            });

        } catch (error) {
            console.error('getLearnerProfile ERROR:', error);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    }
};
