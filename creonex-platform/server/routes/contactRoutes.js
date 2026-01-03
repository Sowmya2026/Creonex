const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', contactController.submitContact);
router.get('/', protect, contactController.getContacts);
router.patch('/read-all', protect, contactController.markAllAsRead);
router.patch('/:id/read', protect, contactController.markAsRead);
router.patch('/:id', protect, contactController.updateContact);
router.delete('/:id', protect, contactController.deleteContact);

module.exports = router;
