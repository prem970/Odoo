const { getDb } = require('../config/db');

module.exports = {
    // Fetches only published courses for learners using robust filtering logic
    getCourses: async (req, res) => {
        try {
            const db = getDb();
            const { category, search, type, minPrice, maxPrice, rating: minRating, duration, sortBy } = req.query;

            // Base query with subqueries for stats
            let query = `
                SELECT 
                    c.id, 
                    c.title, 
                    c.description, 
                    c.image_url, 
                    c.price, 
                    c.created_at, 
                    u.full_name as instructor,
                    (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as students,
                    (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.course_id = c.id) as rating,
                    (SELECT json_agg(tag) FROM course_tags ct WHERE ct.course_id = c.id) as tags,
                    (SELECT COALESCE(SUM(duration), 0) FROM lessons l WHERE l.course_id = c.id) as total_duration
                FROM courses c 
                LEFT JOIN users u ON c.course_admin = u.id 
                WHERE c.published = true
            `;

            const params = [];
            let paramCount = 1;

            if (search) {
                query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
                params.push(`%${search}%`);
                paramCount++;
            }

            if (category && category !== 'All') {
                query += ` AND EXISTS (SELECT 1 FROM course_tags ct WHERE ct.course_id = c.id AND ct.tag = $${paramCount})`;
                params.push(category);
                paramCount++;
            }

            if (type === 'free') {
                query += ` AND c.price = 0`;
            } else if (type === 'paid') {
                query += ` AND c.price > 0`;
            }

            if (minPrice) {
                query += ` AND c.price >= $${paramCount}`;
                params.push(minPrice);
                paramCount++;
            }
            if (maxPrice) {
                query += ` AND c.price <= $${paramCount}`;
                params.push(maxPrice);
                paramCount++;
            }

            if (minRating && minRating !== 'all') {
                query += ` AND (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.course_id = c.id) >= $${paramCount}`;
                params.push(minRating);
                paramCount++;
            }

            if (duration === 'short') {
                query += ` AND (SELECT COALESCE(SUM(duration), 0) FROM lessons l WHERE l.course_id = c.id) < 120`;
            } else if (duration === 'medium') {
                query += ` AND (SELECT COALESCE(SUM(duration), 0) FROM lessons l WHERE l.course_id = c.id) BETWEEN 120 AND 600`;
            } else if (duration === 'long') {
                query += ` AND (SELECT COALESCE(SUM(duration), 0) FROM lessons l WHERE l.course_id = c.id) > 600`;
            }

            // Add Sorting
            switch (sortBy) {
                case 'price-low': query += ` ORDER BY c.price ASC`; break;
                case 'price-high': query += ` ORDER BY c.price DESC`; break;
                case 'rating': query += ` ORDER BY rating DESC`; break;
                case 'popular': query += ` ORDER BY students DESC`; break;
                case 'newest':
                default: query += ` ORDER BY c.created_at DESC`;
            }

            const result = await db.query(query, params);

            const courses = result.rows.map(course => {
                const totalMins = parseInt(course.total_duration) || 0;
                const hours = Math.floor(totalMins / 60);
                const mins = totalMins % 60;
                const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                return {
                    id: course.id,
                    title: course.title,
                    instructor: course.instructor || 'Unknown Instructor',
                    image_url: course.image_url,
                    rating: parseFloat(parseFloat(course.rating).toFixed(1)),
                    students: parseInt(course.students),
                    duration: durationStr,
                    price: parseFloat(course.price),
                    description: course.description
                };
            });

            res.json(courses);
        } catch (error) {
            console.error('FETCH COURSES ERROR:', error);
            res.status(500).json({ message: 'Error fetching courses' });
        }
    },

    // Fetches all courses for instructor (Both Draft and Published)
    getInstructorCourses: async (req, res) => {
        try {
            const db = getDb();
            // Fetch all courses created by this user, order by newest first
            // Include lesson count, total duration, student count, and average rating
            const result = await db.query(`
                SELECT c.*, 
                       COUNT(DISTINCT l.id) as lesson_count, 
                       COALESCE(SUM(l.duration), 0) as total_duration,
                       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count,
                       (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.course_id = c.id) as average_rating
                FROM courses c
                LEFT JOIN lessons l ON c.id = l.course_id
                WHERE c.course_admin = $1
                GROUP BY c.id
                ORDER BY c.created_at DESC
            `, [req.user.id]);
            res.json(result.rows);
        } catch (error) {
            console.error('FETCH INSTRUCTOR COURSES ERROR:', error);
            res.status(500).json({ message: 'Error fetching courses' });
        }
    },

    // Fetches full details for a single course (Public/Learner View)
    getCourseDetails: async (req, res) => {
        const { id } = req.params;
        try {
            const db = getDb();
            const result = await db.query(`
                SELECT c.*, u.full_name as instructor_name 
                FROM courses c
                LEFT JOIN users u ON c.course_admin = u.id
                WHERE c.id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const course = result.rows[0];
            const userRole = (req.user.role || '').toUpperCase();
            const userId = req.user.id;

            // Allow access if: Published OR Admin OR (Instructor AND Owner)
            if (
                course.published ||
                userRole === 'ADMIN' ||
                (userRole === 'INSTRUCTOR' && course.course_admin === userId)
            ) {
                res.json(course);
            } else {
                res.status(404).json({ message: 'Course not found' });
            }
        } catch (error) {
            console.error('FETCH COURSE DETAILS ERROR:', error);
            res.status(500).json({ message: 'Error fetching course details' });
        }
    },

    // Fetches full details for a single course (Admin/Editor View - No published check)
    getAdminCourseDetails: async (req, res) => {
        const { id } = req.params;
        try {
            const db = getDb();
            const result = await db.query(`
                SELECT c.*, u.full_name as responsible_name,
                COALESCE(array_agg(ct.tag) FILTER(WHERE ct.tag IS NOT NULL), '{}') as tags
                FROM courses c 
                LEFT JOIN users u ON c.course_admin = u.id 
                LEFT JOIN course_tags ct ON c.id = ct.course_id
                WHERE c.id = $1
                GROUP BY c.id, u.full_name
                `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Course not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('FETCH ADMIN COURSE DETAILS ERROR:', error);
            res.status(500).json({ message: 'Error fetching course details' });
        }
    },

    getCourseReviews: async (req, res) => {
        const { id } = req.params;
        try {
            const db = getDb();

            // Fetch reviews with user details
            const reviewsRes = await db.query(`
                SELECT r.rating, r.review, r.created_at, u.full_name, u.role_id 
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.course_id = $1
                ORDER BY r.created_at DESC
                `, [id]);

            // Calculate average
            const avgRes = await db.query(`
                SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
                FROM reviews
                WHERE course_id = $1
                `, [id]);

            res.json({
                reviews: reviewsRes.rows,
                stats: {
                    average: parseFloat(avgRes.rows[0].average_rating || 0).toFixed(1),
                    total: parseInt(avgRes.rows[0].total_reviews || 0)
                }
            });
        } catch (error) {
            console.error('GET REVIEWS ERROR:', error);
            res.status(500).json({ message: 'Error fetching reviews' });
        }
    },

    createCourse: async (req, res) => {
        const { title, description, price, access_rule } = req.body;
        const adminId = req.user.id;
        try {
            const db = getDb();
            const result = await db.query(
                `INSERT INTO courses(title, description, price, access_rule, visibility, course_admin)
            VALUES($1, $2, $3, $4, $5, $6) RETURNING * `,
                [title, description, price || 0, access_rule || 'OPEN', 'EVERYONE', adminId]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('CREATE COURSE ERROR:', error);
            res.status(500).json({ message: 'Error creating course' });
        }
    },

    addReview: async (req, res) => {
        const { id } = req.params;
        const { rating, review } = req.body;
        const userId = req.user.id;

        try {
            const db = getDb();
            // Check if user is enrolled
            const enrollment = await db.query(
                'SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2',
                [userId, id]
            );

            if (enrollment.rows.length === 0) {
                return res.status(403).json({ message: 'You must be enrolled in this course to leave a review.' });
            }

            // Insert or Update review
            await db.query(`
                INSERT INTO reviews(user_id, course_id, rating, review)
            VALUES($1, $2, $3, $4)
                ON CONFLICT(user_id, course_id) 
                DO UPDATE SET rating = EXCLUDED.rating, review = EXCLUDED.review, created_at = now()
                `, [userId, id, rating, review]);

            res.status(201).json({ message: 'Review submitted successfully' });
        } catch (error) {
            console.error('ADD REVIEW ERROR:', error);
            res.status(500).json({ message: 'Error submitting review' });
        }
    },

    updateCourse: async (req, res) => {
        const { id } = req.params;
        const { title, description, price, access_rule, image_url, visibility, tags } = req.body;

        try {
            const db = getDb();
            await db.query('BEGIN');

            // Check if admin is trying to update course_admin (Responsible)
            let newCourseAdmin = undefined;
            if (req.body.course_admin) {
                const userCheck = await db.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
                if (userCheck.rows[0].role_id === 1) {
                    newCourseAdmin = req.body.course_admin;
                }
            }

            const result = await db.query(
                `UPDATE courses 
                 SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                access_rule = COALESCE($4, access_rule),
                image_url = COALESCE($5, image_url),
                visibility = COALESCE($6, visibility),
                course_admin = COALESCE($7, course_admin)
                 WHERE id = $8
            RETURNING * `,
                [title, description, price, access_rule, image_url, visibility, newCourseAdmin, id]
            );

            if (result.rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ message: 'Course not found' });
            }

            // Update Tags if provided
            if (tags && Array.isArray(tags)) {
                await db.query('DELETE FROM course_tags WHERE course_id = $1', [id]);
                for (const tag of tags) {
                    await db.query('INSERT INTO course_tags (course_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tag]);
                }
            }

            await db.query('COMMIT');

            const updatedCourse = result.rows[0];
            updatedCourse.tags = tags || [];

            res.json(updatedCourse);
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('UPDATE COURSE ERROR:', error);
            res.status(500).json({ message: 'Error updating course' });
        }
    },

    togglePublish: async (req, res) => {
        const { id } = req.params;
        const { published } = req.body; // Expect boolean

        try {
            const db = getDb();
            const result = await db.query(
                `UPDATE courses SET published = $1 WHERE id = $2 RETURNING * `,
                [published, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Course not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('TOGGLE PUBLISH ERROR:', error);
            res.status(500).json({ message: 'Error updating publish status' });
        }
    },

    deleteCourse: async (req, res) => {
        const { id } = req.params;
        try {
            const db = getDb();
            // Ensure the user owns the course before deleting
            const check = await db.query('SELECT * FROM courses WHERE id = $1 AND course_admin = $2', [id, req.user.id]);
            if (check.rows.length === 0) {
                return res.status(404).json({ message: 'Course not found or unauthorized' });
            }

            // Manual Cascade Delete for tables without ON DELETE CASCADE
            // 1. Delete Enrollments
            await db.query('DELETE FROM enrollments WHERE course_id = $1', [id]);

            // 2. Delete Course Progress (No FK, but good practice to clean up)
            await db.query('DELETE FROM course_progress WHERE course_id = $1', [id]);

            // 3. Delete Reviews
            await db.query('DELETE FROM reviews WHERE course_id = $1', [id]);

            // 4. Delete Quizzes and related data
            // Get all quizzes for this course
            const quizzes = await db.query('SELECT id FROM quizzes WHERE course_id = $1', [id]);
            for (const quiz of quizzes.rows) {
                const quizId = quiz.id;
                await db.query('DELETE FROM quiz_attempts WHERE quiz_id = $1', [quizId]);
                await db.query('DELETE FROM quiz_rewards WHERE quiz_id = $1', [quizId]);
                const questions = await db.query('SELECT id FROM quiz_questions WHERE quiz_id = $1', [quizId]);
                for (const q of questions.rows) {
                    await db.query('DELETE FROM quiz_options WHERE question_id = $1', [q.id]);
                }
                await db.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [quizId]);
            }
            await db.query('DELETE FROM quizzes WHERE course_id = $1', [id]);

            // 5. Delete Course (Lessons and Tags have ON DELETE CASCADE)
            await db.query('DELETE FROM courses WHERE id = $1', [id]);

            res.json({ message: 'Course deleted successfully' });
        } catch (error) {
            console.error('DELETE COURSE ERROR:', error);
            res.status(500).json({ message: 'Error deleting course' });
        }
    },

    getAttendees: async (req, res) => {
        const { id } = req.params;
        try {
            const db = getDb();
            const result = await db.query(`
                SELECT u.id, u.full_name, u.email, e.enrolled_at, e.invited
                FROM enrollments e
                JOIN users u ON e.user_id = u.id
                WHERE e.course_id = $1
                ORDER BY e.enrolled_at DESC
                `, [id]);
            res.json(result.rows);
        } catch (error) {
            console.error('GET ATTENDEES ERROR:', error);
            res.status(500).json({ message: 'Error fetching attendees' });
        }
    },

    addAttendee: async (req, res) => {
        const { id } = req.params;
        const { email } = req.body;
        try {
            const db = getDb();

            const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found with this email' });
            }
            const userId = userResult.rows[0].id;

            const enrollCheck = await db.query('SELECT * FROM enrollments WHERE course_id = $1 AND user_id = $2', [id, userId]);
            if (enrollCheck.rows.length > 0) {
                return res.status(400).json({ message: 'User is already enrolled in this course' });
            }

            await db.query(
                'INSERT INTO enrollments (course_id, user_id, invited) VALUES ($1, $2, true) RETURNING *',
                [id, userId]
            );

            const fullResult = await db.query(`
                SELECT u.id, u.full_name, u.email, e.enrolled_at, e.invited
                FROM enrollments e
                JOIN users u ON e.user_id = u.id
                WHERE e.course_id = $1 AND e.user_id = $2
                `, [id, userId]);

            res.status(201).json(fullResult.rows[0]);
        } catch (error) {
            console.error('ADD ATTENDEE ERROR:', error);
            res.status(500).json({ message: 'Error adding attendee' });
        }
    },

    getEligibleLearners: async (req, res) => {
        const { id } = req.params;
        try {
            const db = getDb();
            const result = await db.query(`
                SELECT u.id, u.full_name, u.email, r.name as role_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE r.name NOT ILIKE 'admin'
                AND u.id NOT IN(
                    SELECT user_id FROM enrollments WHERE course_id = $1
                )
                ORDER BY u.full_name ASC
                `, [id]);
            res.json(result.rows);
        } catch (error) {
            console.error('GET ELIGIBLE LEARNERS ERROR:', error);
            res.status(500).json({ message: 'Error fetching potential attendees' });
        }
    }
};
