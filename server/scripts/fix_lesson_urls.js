require('dotenv').config({ path: __dirname + '/../.env' }); // Adjust if run from 'scripts/' folder
const { getDb } = require('../config/db');

async function fixLessonUrls() {
    try {
        const db = getDb();
        console.log("Updating lesson content URLs...");

        const sampleVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        const res = await db.query(`
            UPDATE lessons 
            SET content_url = $1 
            WHERE type = 'VIDEO'
        `, [sampleVideo]);

        console.log(`Updated ${res.rowCount} video lessons to use sample video.`);

        const samplePdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        const resDoc = await db.query(`
            UPDATE lessons 
            SET content_url = $1 
            WHERE type = 'DOCUMENT'
        `, [samplePdf]);

        console.log(`Updated ${resDoc.rowCount} document lessons to use sample PDF.`);

        console.log("Fix complete!");
        process.exit(0);

    } catch (err) {
        console.error("Error updating DB:", err);
        process.exit(1);
    }
}

fixLessonUrls();
