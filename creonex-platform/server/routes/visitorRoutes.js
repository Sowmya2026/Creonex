const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/track', visitorController.trackVisitor);
router.get('/', protect, visitorController.getVisitors);
router.delete('/clear', protect, visitorController.clearVisitors);
router.get('/analytics', protect, visitorController.getAnalytics);
router.get('/analytics/pages', protect, visitorController.getTopPages);
router.get('/stats', protect, visitorController.getStats);

module.exports = router;
