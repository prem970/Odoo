const { getDb } = require('../config/db');

module.exports = {
    // 1. Get All Live Sessions (with filters)
    getSessions: async (req, res) => {
        try {
            const { status, courseId } = req.query;
            let query = `
        SELECT ls.*, c.title as course_title, u.full_name as instructor_name
        FROM live_sessions ls
        JOIN courses c ON ls.course_id = c.id
        LEFT JOIN users u ON ls.instructor_id = u.id
        WHERE 1=1 AND c.published = true
      `;
            const params = [];
            let paramIndex = 1;

            if (status) {
                query += ` AND ls.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            if (courseId) {
                query += ` AND ls.course_id = $${paramIndex}`;
                params.push(courseId);
                paramIndex++;
            }

            query += ` ORDER BY ls.start_time ASC`;

            const result = await getDb().query(query, params);
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching sessions' });
        }
    },

    // 2. Create Live Session (Instructor Only)
    createSession: async (req, res) => {
        try {
            const { courseId, title, description, startTime, endTime, meetingUrl } = req.body;
            const instructorId = req.user.id; // From auth middleware

            const result = await getDb().query(
                `INSERT INTO live_sessions (course_id, title, description, instructor_id, start_time, end_time, meeting_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'SCHEDULED')
         RETURNING *`,
                [courseId, title, description, instructorId, startTime, endTime, meetingUrl]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error creating session' });
        }
    },

    // 3. Get Session Details
    getSessionInternal: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await getDb().query(
                `SELECT ls.*, c.title as course_title, u.full_name as instructor_name
         FROM live_sessions ls
         JOIN courses c ON ls.course_id = c.id
         LEFT JOIN users u ON ls.instructor_id = u.id
         WHERE ls.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Session not found' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching session details' });
        }
    },

    // 4. Join Session (Check access + Log attendance)
    joinSession: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if user has access to course?
            // For now, assume enrolled check is done or open

            // Log attendance
            await getDb().query(
                `INSERT INTO session_attendance (session_id, user_id, status)
         VALUES ($1, $2, 'PRESENT')
         ON CONFLICT DO NOTHING`, // Prevent duplicate log if implemented with unique constraint
                [id, userId]
            );

            // Return meeting details
            const result = await getDb().query('SELECT meeting_url FROM live_sessions WHERE id = $1', [id]);
            res.json({ meetingUrl: result.rows[0].meeting_url });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error joining session' });
        }
    }
};
