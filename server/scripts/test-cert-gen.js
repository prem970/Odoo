const { generateCertificate } = require('../utils/generateCertificate');
const path = require('path');
const fs = require('fs');

async function testGeneration() {
    console.log('--- Testing Certificate Generation ---');

    const sampleData = {
        learnerName: "John Doe Test",
        courseTitle: "Advanced React Patterns",
        completionDate: new Date().toLocaleDateString(),
        certificateId: "TEST-CERT-001"
    };

    try {
        console.log('Generating PDF with data:', sampleData);
        const filePath = await generateCertificate(sampleData);
        console.log('✅ PDF Generated successfully!');
        console.log('File Path:', filePath);

        if (fs.existsSync(filePath)) {
            console.log('Functionality Verified: File exists on disk.');
        } else {
            console.error('❌ File not found after generation.');
        }

    } catch (error) {
        console.error('❌ Generation Failed:', error);
    }
}

testGeneration();
