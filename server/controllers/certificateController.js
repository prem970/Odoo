const CertificateModel = require('../models/certificateModel');
const { generateCertificate } = require('../utils/generateCertificate');
const { getDb } = require('../config/db');
const path = require('path');
const fs = require('fs');

const generate = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;
    const user = req.user; // Contains full_name, email

    try {
        const db = getDb();

        // 1. Check if eligible (100% completion)
        const progressRes = await db.query(
            'SELECT completion_percentage, status FROM course_progress WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (progressRes.rows.length === 0 || progressRes.rows[0].completion_percentage < 100) {
            return res.status(403).json({ message: 'Course not completed yet.' });
        }

        // 2. Check if certificate already exists
        const existingCert = await CertificateModel.getCertificate(userId, courseId);
        if (existingCert) {
            return res.json(existingCert);
        }

        // 3. Get Course Details
        const courseRes = await db.query('SELECT title FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ message: 'Course not found' });
        const courseTitle = courseRes.rows[0].title;

        // 4. Generate Certificate Data
        const date = new Date();
        const year = date.getFullYear();
        // Generate a random part or sequence. Ideally use a DB sequence, but random is okay for now.
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const certificateId = `LS-${year}-${suffix}-${userId.substring(0, 4)}`.toUpperCase();

        const completionDate = date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // 5. Generate PDF
        const filePath = await generateCertificate({
            learnerName: user.full_name || user.name,
            courseTitle: courseTitle,
            completionDate: completionDate,
            certificateId: certificateId
        });

        // 6. Save to DB
        // Determine URL (In production this might be different, but for now serves from static)
        // We'll store the filename and serve via a specific route
        const fileName = path.basename(filePath);
        const pdfUrl = `/api/certificates/download/${certificateId}`; // Virtual URL

        const newCert = await CertificateModel.createCertificate({
            userId,
            courseId,
            certificateId,
            pdfUrl
        });

        res.status(201).json(newCert);

    } catch (error) {
        console.error('Certificate Generation Error:', error);
        res.status(500).json({ message: 'Error generating certificate' });
    }
};

const getMyCertificate = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    try {
        const cert = await CertificateModel.getCertificate(userId, courseId);
        if (!cert) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        res.json(cert);
    } catch (error) {
        console.error('Get Certificate Error:', error);
        res.status(500).json({ message: 'Error fetching certificate' });
    }
};

const download = async (req, res) => {
    const { id } = req.params; // Certificate ID (e.g., LS-2026...)

    try {
        const cert = await CertificateModel.getCertificateById(id);

        if (!cert) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Check ownership? (Optional: public verification allows download vs restricted)
        // For now, allow download if you have the Link or ID.

        // Construct file path
        // The DB might store full path or just relative. 
        // Previously we stored virtual URL. We need to reconstruct path or store path in DB.
        // Let's rely on standard ID -> Filename mapping if we saved it as ID.pdf

        const filePath = path.join(__dirname, '../certificates/output', `${cert.certificate_id}.pdf`);

        if (fs.existsSync(filePath)) {
            res.download(filePath, `Certificate-${cert.certificate_id}.pdf`);
        } else {
            console.error('File missing for cert:', cert.certificate_id);
            res.status(404).json({ message: 'Certificate file missing' });
        }

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
};

module.exports = { generate, getMyCertificate, download };
