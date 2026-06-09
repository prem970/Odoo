const { getDb } = require('../config/db');

module.exports = {
    // Fetches all lessons for a specific course, ordered by lesson_order
    getLessonsByCourse: async (req, res) => {
        const { courseId } = req.params;
        const userId = req.user.id; // User context needed for progress

        try {
            const db = getDb();
            const result = await db.query(`
                SELECT 
                    l.*, 
                    COALESCE(lp.completed, false) as completed,
                     lp.completed_at
                FROM lessons l
                JOIN courses c ON l.course_id = c.id
                LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $2
                WHERE l.course_id = $1 AND c.published = true
                ORDER BY l.lesson_order ASC
            `, [courseId, userId]);
            res.json(result.rows);
        } catch (error) {
            console.error('FETCH LESSONS ERROR:', error);
            res.status(500).json({ message: 'Error fetching lessons' });
        }
    },

    // Mark lesson as complete
    markComplete: async (req, res) => {
        const { lessonId } = req.params;
        const userId = req.user.id;

        try {
            const db = getDb();

            // Check if already completed
            const check = await db.query(
                `SELECT completed FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2`,
                [userId, lessonId]
            );

            if (check.rows.length === 0) {
                await db.query(`
                    INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
                    VALUES ($1, $2, true, NOW())
                `, [userId, lessonId]);
            } else if (!check.rows[0].completed) {
                await db.query(`
                    UPDATE lesson_progress 
                    SET completed = true, completed_at = NOW()
                    WHERE user_id = $1 AND lesson_id = $2
                `, [userId, lessonId]);
            }

            res.json({ message: 'Lesson marked complete' });
        } catch (error) {
            console.error('MARK LESSON ERROR:', error);
            res.status(500).json({ message: 'Error updating lesson progress' });
        }
    },

    // Adds a new lesson to a course
    addLesson: async (req, res) => {
        const { courseId, title, type, content_url, duration, lesson_order } = req.body;

        // Basic type validation based on schema constraint
        const validTypes = ['VIDEO', 'DOCUMENT', 'IMAGE', 'QUIZ'];
        if (type && !validTypes.includes(type.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid lesson type' });
        }

        try {
            const db = getDb();
            const result = await db.query(
                `INSERT INTO lessons (course_id, title, type, content_url, duration, lesson_order) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [courseId, title, type ? type.toUpperCase() : 'VIDEO', content_url, duration || 0, lesson_order || 0]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('ADD LESSON ERROR:', error);
            res.status(500).json({ message: 'Error adding lesson' });
        }
    },

    updateLesson: async (req, res) => {
        const { id } = req.params;
        const { title, type, content_url, duration, lesson_order } = req.body;

        try {
            const db = getDb();
            const result = await db.query(
                `UPDATE lessons
                 SET title = COALESCE($1, title),
                     type = COALESCE($2, type),
                     content_url = COALESCE($3, content_url),
                     duration = COALESCE($4, duration),
                     lesson_order = COALESCE($5, lesson_order)
                 WHERE id = $6
                 RETURNING *`,
                [title, type, content_url, duration, lesson_order, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('UPDATE LESSON ERROR:', error);
            res.status(500).json({ message: 'Error updating lesson' });
        }
    },

    deleteLesson: async (req, res) => {
        const { id } = req.params;
        try {
            const db = getDb();
            const result = await db.query('DELETE FROM lessons WHERE id = $1 RETURNING id', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Lesson not found' });
            }

            res.json({ message: 'Lesson deleted successfully' });
        } catch (error) {
            console.error('DELETE LESSON ERROR:', error);
            res.status(500).json({ message: 'Error deleting lesson' });
        }
    },

    reorderLessons: async (req, res) => {
        const { lessons } = req.body; // Expects [{ id, lesson_order }, ...]

        if (!Array.isArray(lessons)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        try {
            const db = getDb();
            // Use a transaction for safety
            await db.query('BEGIN');

            for (const lesson of lessons) {
                await db.query(
                    'UPDATE lessons SET lesson_order = $1 WHERE id = $2',
                    [lesson.lesson_order, lesson.id]
                );
            }

            await db.query('COMMIT');
            res.json({ message: 'Lessons reordered successfully' });
        } catch (error) {
            await getDb().query('ROLLBACK');
            console.error('REORDER LESSONS ERROR:', error);
            res.status(500).json({ message: 'Error reordering lessons' });
        }
    },
};
