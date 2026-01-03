const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/catalogInquiryController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/', inquiryController.createInquiry);

// Protected routes (Admin only)
router.get('/admin/all', protect, inquiryController.getAdminInquiries);
router.put('/:id', protect, inquiryController.updateInquiryStatus);
router.delete('/:id', protect, inquiryController.deleteInquiry);

module.exports = router;
