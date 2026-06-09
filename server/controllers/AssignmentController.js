const { getDb } = require('../config/db');

module.exports = {
    // 1. Get Assignments for a course (or all for user)
    getAssignments: async (req, res) => {
        try {
            const { courseId } = req.query;
            const userId = req.user.id;

            let query = `
        SELECT a.*, c.title as course_title, s.id as submission_id, s.status, s.grade
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = $1
        WHERE 1=1 AND c.published = true
      `;
            const params = [userId];

            if (courseId) {
                query += ` AND a.course_id = $2`;
                params.push(courseId);
            }

            query += ` ORDER BY a.due_date ASC`;

            const result = await getDb().query(query, params);
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching assignments' });
        }
    },

    // 2. Submit Assignment
    submitWork: async (req, res) => {
        try {
            const { assignmentId, textContent, fileUrl } = req.body;
            const userId = req.user.id;

            // Check if already submitted? (Optional: Allow resubmission)

            const result = await getDb().query(
                `INSERT INTO submissions (assignment_id, user_id, text_content, file_url, status)
         VALUES ($1, $2, $3, $4, 'SUBMITTED')
         RETURNING *`,
                [assignmentId, userId, textContent, fileUrl]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error submitting work' });
        }
    }
};
