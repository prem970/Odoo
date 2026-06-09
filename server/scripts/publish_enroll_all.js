require('dotenv').config({ path: __dirname + '/../.env' });
const { getDb } = require('../config/db');

async function publishAndEnroll() {
    try {
        const db = getDb();
        console.log("Checking courses...");

        const allCourses = await db.query('SELECT id, title, published FROM courses');
        console.log(`Found ${allCourses.rows.length} total courses.`);

        if (allCourses.rows.length === 0) {
            console.log("No courses found in database at all.");
        } else {
            const unpublished = allCourses.rows.filter(c => !c.published);
            if (unpublished.length > 0) {
                console.log(`Publishing ${unpublished.length} courses...`);
                await db.query('UPDATE courses SET published = true');
                console.log("All courses published.");
            } else {
                console.log("All courses are already published.");
            }

            const activeCourses = await db.query('SELECT id FROM courses WHERE published = true');
            const users = await db.query('SELECT id, email FROM users');

            for (const user of users.rows) {
                for (const course of activeCourses.rows) {
                    const check = await db.query('SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2', [user.id, course.id]);
                    if (check.rows.length === 0) {
                        try {
                            await db.query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [user.id, course.id]);
                            console.log(`Enrolled ${user.email} -> Course ${course.id.substring(0, 8)}...`);
                        } catch (e) {
                            console.error(`Failed to enroll ${user.email}:`, e.message);
                        }
                    }
                }
            }
            console.log("Done enrolling.");
        }
        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

publishAndEnroll();
