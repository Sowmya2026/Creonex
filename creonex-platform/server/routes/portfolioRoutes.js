const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', portfolioController.getPortfolio);
router.get('/featured', portfolioController.getFeaturedPortfolio);
router.get('/categories', portfolioController.getCategories);
router.get('/:id', portfolioController.getPortfolioItem);

// Protected routes (Admin only)
router.get('/admin/all', protect, portfolioController.getAdminPortfolio);
router.post('/', protect, portfolioController.createPortfolioItem);
router.put('/:id', protect, portfolioController.updatePortfolioItem);
router.delete('/:id', protect, portfolioController.deletePortfolioItem);

module.exports = router;
