const PDFDocument = require('pdfkit');
const admin = require('firebase-admin');
const db = admin.firestore();

// Helper to generate Invoice Number
const generateInvoiceNumber = async () => {
    try {
        const invoicesRef = db.collection('invoices');
        const snapshot = await invoicesRef.orderBy('createdAt', 'desc').limit(1).get();

        if (snapshot.empty) {
            return 'CRX-INV-001';
        }

        const lastInvoice = snapshot.docs[0].data();
        const lastNum = parseInt(lastInvoice.invoiceNumber.split('-').pop());
        const nextNum = lastNum + 1;
        return `CRX-INV-${String(nextNum).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating invoice number:', error);
        return 'CRX-INV-001';
    }
};

// Create Invoice
exports.createInvoice = async (req, res) => {
    try {
        console.log('Creating invoice with data:', JSON.stringify(req.body, null, 2));
        const { date, billedTo, items, totalAmount } = req.body;

        console.log('Generating invoice number...');
        const invoiceNumber = await generateInvoiceNumber();
        console.log('Invoice number generated:', invoiceNumber);

        const invoiceData = {
            invoiceNumber,
            date: date || new Date().toISOString(),
            billedTo,
            items,
            totalAmount,
            status: 'generated',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        console.log('Saving invoice to Firestore...');
        const docRef = await db.collection('invoices').add(invoiceData);
        console.log('Invoice saved successfully:', docRef.id);

        const savedInvoice = {
            _id: docRef.id,
            ...invoiceData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        res.status(201).json(savedInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error creating invoice', error: error.message });
    }
};

// Get All Invoices
exports.getInvoices = async (req, res) => {
    try {
        const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').get();
        const invoices = [];

        snapshot.forEach(doc => {
            invoices.push({
                _id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};

// Get Single Invoice
exports.getInvoice = async (req, res) => {
    try {
        const doc = await db.collection('invoices').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({
            _id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ message: 'Error fetching invoice', error: error.message });
    }
};

// Delete Invoice
exports.deleteInvoice = async (req, res) => {
    try {
        await db.collection('invoices').doc(req.params.id).delete();
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ message: 'Error deleting invoice', error: error.message });
    }
};

// Update Invoice
exports.updateInvoice = async (req, res) => {
    try {
        const { date, billedTo, items, totalAmount } = req.body;
        const updateData = {
            date: date || new Date().toISOString(),
            billedTo,
            items,
            totalAmount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('invoices').doc(req.params.id).update(updateData);
        
        res.status(200).json({ message: 'Invoice updated successfully', _id: req.params.id });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ message: 'Error updating invoice', error: error.message });
    }
};

// Generate PDF - Matching uploaded format exactly
exports.generatePDF = async (req, res) => {
    try {
        const doc = await db.collection('invoices').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoice = doc.data();
        const pdf = new PDFDocument({
            margin: 72,
            size: 'A4'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
        pdf.pipe(res);

        // Brand Colors
        const PRIMARY = '#3A2C27';      // Your dark brown
        const ACCENT = '#8B6F47';       // Your golden brown
        const LIGHT = '#8B7A6F';        // Muted brown
        const BORDER = '#E5E0DB';       // Light tan border

        const formatDate = (d) => {
            try {
                if (!d) return 'N/A';
                const date = typeof d === 'string' ? new Date(d) : d;
                if (isNaN(date.getTime())) return 'N/A';
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            } catch (err) {
                console.error("Format date error:", err);
                return 'N/A';
            }
        };

        let y = 72;

        // ===== HEADER =====
        // Large INVOICE title
        pdf.font('Helvetica-Bold').fontSize(52).fillColor(PRIMARY).text('INVOICE', 72, y);

        // Logo placeholder - top right
        pdf.rect(480, y + 10, 70, 50).stroke(BORDER);
        pdf.font('Helvetica').fontSize(10).fillColor(LIGHT).text('LOGO', 480, y + 28, { width: 70, align: 'center' });

        y += 55;

        // Invoice details below title
        pdf.font('Helvetica').fontSize(12).fillColor(PRIMARY);
        pdf.text('Invoice No: ', 72, y, { continued: true });
        pdf.font('Helvetica-Bold').text(invoice.invoiceNumber);

        y += 16;
        pdf.font('Helvetica').text('Date: ', 72, y, { continued: true });
        pdf.font('Helvetica-Bold').text(formatDate(invoice.date));

        y += 40;

        // ===== FROM & BILLED TO SECTIONS =====
        const leftX = 72;
        const rightX = 320;

        // FROM label
        pdf.font('Helvetica').fontSize(10).fillColor(LIGHT).text('FROM:', leftX, y);

        // BILLED TO label
        pdf.text('BILLED TO:', rightX, y);

        y += 25;

        // FROM content
        pdf.font('Helvetica-Bold').fontSize(14).fillColor(PRIMARY).text('Creonex.viz', leftX, y);
        y += 18;
        pdf.font('Helvetica').fontSize(11).fillColor(PRIMARY).text('AI Visuals & Creative Content Studio', leftX, y);
        y += 15;
        pdf.text('Email: creonex.viz@gmail.com', leftX, y);
        y += 15;
        pdf.text('Phone: 8555074387', leftX, y);

        // Reset y for BILLED TO
        y -= 52; // Go back to align with FROM content

        // BILLED TO content
        const billedToName = invoice.billedTo?.name || 'N/A';
        const billedToAddress = invoice.billedTo?.address || '';
        
        pdf.font('Helvetica-Bold').fontSize(14).fillColor(PRIMARY).text(billedToName, rightX, y, { width: 230 });
        y += 22;

        // Address
        pdf.font('Helvetica').fontSize(11).fillColor(PRIMARY);
        const addressLines = typeof billedToAddress === 'string' ? billedToAddress.split('\n') : [];
        addressLines.forEach(line => {
            pdf.text(line, rightX, y, { width: 230 });
            y += 16;
        });

        y += 10;

        // GSTIN and PAN
        if (invoice.billedTo?.gstin) {
            pdf.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY).text('GSTIN: ', rightX, y, { continued: true });
            pdf.font('Helvetica').text(invoice.billedTo.gstin);
            y += 18;
        }

        if (invoice.billedTo?.pan) {
            pdf.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY).text('PAN: ', rightX, y, { continued: true });
            pdf.font('Helvetica').text(invoice.billedTo.pan);
        }

        y += 45;

        // ===== ITEMS TABLE =====
        const tableY = y;

        // Table header
        pdf.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY);
        pdf.text('DESCRIPTION', 72, tableY);
        pdf.text('QTY', 320, tableY, { width: 60, align: 'center' });
        pdf.text('RATE', 390, tableY, { width: 70, align: 'right' });
        pdf.text('AMOUNT', 470, tableY, { width: 80, align: 'right' });

        y = tableY + 25;

        // Header line
        pdf.strokeColor(ACCENT).lineWidth(2).moveTo(72, y).lineTo(550, y).stroke();

        y += 20;

        // Items
        pdf.font('Helvetica').fontSize(11).fillColor(PRIMARY);

        const items = Array.isArray(invoice.items) ? invoice.items : [];
        items.forEach(item => {
            const description = item.description || 'N/A';
            const quantity = item.quantity || '0';
            const rate = Number(item.rate) || 0;
            const amount = Number(item.amount) || 0;

            // Calculate the height this item will need
            const descHeight = pdf.heightOfString(description, { width: 240 });
            const itemHeight = Math.max(descHeight, 35);

            // Check if we need a new page BEFORE rendering the item
            if (y + itemHeight > 720) {
                pdf.addPage();
                y = 72;

                // Repeat table header on new page
                pdf.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY);
                pdf.text('DESCRIPTION', 72, y);
                pdf.text('QTY', 320, y, { width: 60, align: 'center' });
                pdf.text('RATE', 390, y, { width: 70, align: 'right' });
                pdf.text('AMOUNT', 470, y, { width: 80, align: 'right' });

                y += 25;
                pdf.strokeColor(ACCENT).lineWidth(2).moveTo(72, y).lineTo(550, y).stroke();
                y += 20;

                pdf.font('Helvetica').fontSize(11).fillColor(PRIMARY);
            }

            // Now render the item
            pdf.text(description, 72, y, { width: 240 });
            pdf.text(String(quantity), 320, y, { width: 60, align: 'center' });
            pdf.text(rate.toLocaleString('en-IN'), 390, y, { width: 70, align: 'right' });
            pdf.font('Helvetica-Bold').text(amount.toLocaleString('en-IN'), 470, y, { width: 80, align: 'right' });
            pdf.font('Helvetica');
            y += itemHeight + 5; // Use actual height + small gap
        });

        y += 10;

        // Bottom line
        pdf.strokeColor(BORDER).lineWidth(1).moveTo(72, y).lineTo(550, y).stroke();

        y += 30;

        // ===== TOTAL =====
        const totalAmount = Number(invoice.totalAmount) || 0;
        pdf.font('Helvetica').fontSize(11).fillColor(LIGHT).text('Total Amount:', 350, y, { align: 'right' });
        y += 20;
        pdf.font('Helvetica-Bold').fontSize(20).fillColor(PRIMARY).text('Rs ' + totalAmount.toLocaleString('en-IN') + ' /-', 350, y, { align: 'right' });

        y += 35;

        // Amount in words
        const toWords = (num) => {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            if (num.toString().length > 9) return '';
            const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return '';

            let str = '';
            str += (n[1] != 0) ? (ones[Number(n[1])] || tens[n[1][0]] + ' ' + ones[n[1][1]]) + ' Crore ' : '';
            str += (n[2] != 0) ? (ones[Number(n[2])] || tens[n[2][0]] + ' ' + ones[n[2][1]]) + ' Lakh ' : '';
            str += (n[3] != 0) ? (ones[Number(n[3])] || tens[n[3][0]] + ' ' + ones[n[3][1]]) + ' Thousand ' : '';
            str += (n[4] != 0) ? (ones[Number(n[4])] || tens[n[4][0]] + ' ' + ones[n[4][1]]) + ' Hundred ' : '';
            str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (ones[Number(n[5])] || tens[n[5][0]] + ' ' + ones[n[5][1]]) : '';

            return str.trim();
        };

        const words = toWords(Math.round(totalAmount));
        if (words) {
            pdf.font('Helvetica-Oblique').fontSize(10).fillColor(LIGHT)
                .text('(Rupees ' + words + ' Only)', 72, y, { width: 478, align: 'right' });
        }

        y += 50;

        // ===== FOOTER =====
        pdf.strokeColor(BORDER).lineWidth(1).moveTo(72, y).lineTo(550, y).stroke();
        y += 30;

        // Payment details
        pdf.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY).text('PAYMENT DETAILS', 72, y);
        y += 20;

        const payments = [
            ['Account Name:', 'Ms. Beemer Sowmya'],
            ['Bank Name:', 'State Bank of India'],
            ['Account Number:', '62148655051'],
            ['IFSC Code:', 'SBIN0020295']
        ];

        payments.forEach(([label, value]) => {
            pdf.font('Helvetica').fontSize(10).fillColor(LIGHT).text(label, 72, y, { continued: true });
            pdf.font('Helvetica-Bold').fillColor(PRIMARY).text(' ' + value);
            y += 16;
        });

        // Notes
        const notesY = y - 80;
        pdf.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY).text('NOTES', 320, notesY);

        const notes = [
            'Services include AI-generated images and video visuals.',
            'No physical products or printing involved.',
            'Digital services rendered for presentation purposes.'
        ];

        let ny = notesY + 20;
        notes.forEach(note => {
            pdf.font('Helvetica').fontSize(9).fillColor(PRIMARY).text('- ' + note, 320, ny, { width: 230, lineGap: 2 });
            const textHeight = pdf.heightOfString('- ' + note, { width: 230, lineGap: 2 });
            ny += textHeight + 6;
        });

        // Footer text
        const footerY = Math.max(y, ny) + 20;
        pdf.font('Helvetica').fontSize(9).fillColor(LIGHT)
            .text('Generated by Creonex Platform', 72, footerY, { width: 478, align: 'center' });

        pdf.end();

    } catch (error) {
        console.error("PDF Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating PDF', error: error.message });
        }
    }
};
