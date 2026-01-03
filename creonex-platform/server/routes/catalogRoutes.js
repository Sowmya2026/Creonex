const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', catalogController.getCatalogs);
router.get('/:id', catalogController.getCatalog);

// Protected routes (Admin only)
router.get('/admin/all', protect, catalogController.getAdminCatalogs);
router.post('/', protect, catalogController.createCatalog);
router.put('/:id', protect, catalogController.updateCatalog);
router.delete('/:id', protect, catalogController.deleteCatalog);

module.exports = router;
