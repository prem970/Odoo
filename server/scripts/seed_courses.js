require('dotenv').config({ path: __dirname + '/../.env' });
const { getDb } = require('../config/db');

const courses = [
    {
        title: 'Mastering React & Redux',
        description: 'A comprehensive guide to building modern web applications with React 18 and Redux Toolkit.',
        image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
        price: 49.99,
        lessons: [
            { title: 'Introduction to React', type: 'VIDEO', duration: 15 },
            { title: 'Components & Props', type: 'VIDEO', duration: 25 },
            { title: 'State Management', type: 'VIDEO', duration: 30 },
            { title: 'React Hooks Deep Dive', type: 'VIDEO', duration: 45 }
        ]
    },
    {
        title: 'Python for Data Science',
        description: 'Learn Python from scratch and master libraries like Pandas, NumPy, and Matplotlib.',
        image_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=2074&auto=format&fit=crop',
        price: 59.99,
        lessons: [
            { title: 'Python Basics', type: 'VIDEO', duration: 20 },
            { title: 'Data Structures', type: 'VIDEO', duration: 35 },
            { title: 'Pandas for Analysis', type: 'VIDEO', duration: 40 },
            { title: 'Data Visualization', type: 'VIDEO', duration: 30 }
        ]
    },
    {
        title: 'UI/UX Design Fundamentals',
        description: 'Design beautiful user interfaces and create seamless user experiences using Figma.',
        image_url: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d0f?q=80&w=1974&auto=format&fit=crop',
        price: 39.99,
        lessons: [
            { title: 'Design Principles', type: 'VIDEO', duration: 25 },
            { title: 'Color Theory', type: 'VIDEO', duration: 20 },
            { title: 'Typography', type: 'VIDEO', duration: 15 },
            { title: 'Prototyping in Figma', type: 'VIDEO', duration: 50 }
        ]
    }
];

async function seed() {
    try {
        const db = getDb();
        console.log('Seeding courses...');

        // Verify users exist to assign as course_admin
        const userRes = await db.query('SELECT id FROM users LIMIT 1');
        const adminId = userRes.rows[0]?.id;

        if (!adminId) {
            console.log('No users found. Please seed users first.');
            return;
        }

        for (const course of courses) {
            // Check if course exists
            const existing = await db.query('SELECT id FROM courses WHERE title = $1', [course.title]);
            let courseId;

            if (existing.rows.length === 0) {
                const res = await db.query(
                    `INSERT INTO courses (title, description, image_url, price, published, course_admin, visibility, access_rule)
                     VALUES ($1, $2, $3, $4, true, $5, 'EVERYONE', 'OPEN')
                     RETURNING id`,
                    [course.title, course.description, course.image_url, course.price, adminId]
                );
                courseId = res.rows[0].id;
                console.log(`Created course: ${course.title}`);
            } else {
                courseId = existing.rows[0].id;
                console.log(`Course exists: ${course.title}`);
            }

            // Seed lessons
            for (let i = 0; i < course.lessons.length; i++) {
                const lesson = course.lessons[i];
                await db.query(
                    `INSERT INTO lessons (course_id, title, type, duration, lesson_order)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT DO NOTHING`, // simplified conflict handling
                    [courseId, lesson.title, lesson.type, lesson.duration, i + 1]
                );
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
