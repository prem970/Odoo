const { getDb } = require('../config/db');

const CertificateModel = {
    // Initialize table if it doesn't exist (Self-healing)
    createCertificateTable: async () => {
        const db = getDb();
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS certificates (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id),
                    course_id UUID REFERENCES courses(id),
                    certificate_id TEXT UNIQUE NOT NULL,
                    pdf_url TEXT,
                    issued_date TIMESTAMP DEFAULT now(),
                    created_at TIMESTAMP DEFAULT now(),
                    UNIQUE(user_id, course_id)
                );
            `);
            console.log('✅ Certificates table verified/created.');
        } catch (error) {
            console.error('❌ Error creating certificates table:', error);
        }
    },

    createCertificate: async ({ userId, courseId, certificateId, pdfUrl }) => {
        const db = getDb();
        const result = await db.query(
            `INSERT INTO certificates (user_id, course_id, certificate_id, pdf_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, courseId, certificateId, pdfUrl]
        );
        return result.rows[0];
    },

    getCertificate: async (userId, courseId) => {
        const db = getDb();
        const result = await db.query(
            `SELECT * FROM certificates WHERE user_id = $1 AND course_id = $2`,
            [userId, courseId]
        );
        return result.rows[0];
    },

    getCertificateById: async (certificateId) => {
        const db = getDb();
        const result = await db.query(
            `SELECT c.*, u.full_name as learner_name, co.title as course_title, co.course_admin
             FROM certificates c
             JOIN users u ON c.user_id = u.id
             JOIN courses co ON c.course_id = co.id
             WHERE c.certificate_id = $1`,
            [certificateId]
        );
        return result.rows[0];
    }
};

module.exports = CertificateModel;
