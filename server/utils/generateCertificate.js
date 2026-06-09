const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (data) => {
    const { learnerName, courseTitle, completionDate, certificateId } = data;

    try {
        // Paths
        const templatePath = path.join(__dirname, '../certificates/template.png');
        const outputDir = path.join(__dirname, '../certificates/output');

        // Ensure output dir exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([842, 595]); // A4 Landscape (approx)
        const { width, height } = page.getSize();

        // Embed Template
        let templateImage;
        if (fs.existsSync(templatePath)) {
            const templateBytes = fs.readFileSync(templatePath);
            templateImage = await pdfDoc.embedPng(templateBytes);
            page.drawImage(templateImage, {
                x: 0,
                y: 0,
                width: width,
                height: height,
            });
        } else {
            // Fallback if template missing (Draw a border)
            page.drawRectangle({
                x: 20, y: 20, width: width - 40, height: height - 40,
                borderColor: rgb(0, 0, 0), borderWidth: 2
            });
            page.drawText('Certificate Template Missing', { x: 50, y: height - 50, size: 20 });
        }

        // Fonts
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Helper to center text
        const drawCenteredText = (text, y, size, fontToUse = font, color = rgb(0, 0, 0)) => {
            const textWidth = fontToUse.widthOfTextAtSize(text, size);
            page.drawText(text, {
                x: (width - textWidth) / 2,
                y: y,
                size: size,
                font: fontToUse,
                color: color,
            });
        };

        // --- Dynamic Text Overlay ---
        // Coordinates need tuning based on actual template. 
        // Assuming standard layout: Name in middle, Course below, ID bottom right.

        // 1. Learner Name (Center, prominent)
        drawCenteredText(learnerName, height / 2 + 20, 32, font, rgb(0.1, 0.1, 0.1));

        // 2. "For successfully completing..." (Static context if needed, or part of template)
        // drawCenteredText('For successfully completing the course', height / 2 - 20, 14, regularFont);

        // 3. Course Title (Center, below name)
        drawCenteredText(courseTitle, height / 2 - 50, 24, font, rgb(0.2, 0.2, 0.6));

        // 4. Date (Bottom Center or specific line)
        drawCenteredText(`Issued on: ${completionDate}`, 120, 12, regularFont);

        // 5. Certificate ID (Bottom Right Corner)
        page.drawText(`ID: ${certificateId}`, {
            x: width - 200,
            y: 40,
            size: 10,
            font: regularFont,
            color: rgb(0.5, 0.5, 0.5),
        });

        // Save PDF
        const fileName = `${certificateId}.pdf`;
        const filePath = path.join(outputDir, fileName);
        const pdfBytes = await pdfDoc.save();

        fs.writeFileSync(filePath, pdfBytes);

        // Return relative path for DB/URL
        return filePath;

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

module.exports = { generateCertificate };
