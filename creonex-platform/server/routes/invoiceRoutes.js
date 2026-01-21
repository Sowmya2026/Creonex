const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Routes
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoice);
router.get('/:id/pdf', invoiceController.generatePDF);

module.exports = router;
