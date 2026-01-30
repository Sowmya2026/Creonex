const express = require('express');
const router = express.Router();
const {
    getLinks,
    getLinkItem,
    createLinkItem,
    updateLinkItem,
    deleteLinkItem,
    getMetaData
} = require('../controllers/linkController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getLinks);
router.get('/:id', getLinkItem);

// Protected routes
router.post('/meta', protect, getMetaData);
router.post('/', protect, createLinkItem);
router.put('/:id', protect, updateLinkItem);
router.delete('/:id', protect, deleteLinkItem);

module.exports = router;
