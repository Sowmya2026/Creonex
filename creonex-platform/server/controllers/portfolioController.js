const firestoreService = require('../services/firestore.service');

/**
 * @desc    Get all portfolio items (admin)
 * @route   GET /api/portfolio/admin/all
 * @access  Private
 */
exports.getAdminPortfolio = async (req, res) => {
    try {
        const items = await firestoreService.getAll('portfolio', {
            orderBy: ['order', 'asc']
        });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Admin Portfolio Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all portfolio items (public)
 * @route   GET /api/portfolio
 * @access  Public
 */
exports.getPortfolio = async (req, res) => {
    try {
        const { category } = req.query;

        let items;
        if (category) {
            items = await firestoreService.query('portfolio', [
                ['category', '==', category],
                ['isActive', '==', true]
            ], {
                orderBy: ['order', 'asc']
            });
        } else {
            items = await firestoreService.query('portfolio', [
                ['isActive', '==', true]
            ], {
                orderBy: ['order', 'asc']
            });
        }

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Portfolio Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get featured portfolio items
 * @route   GET /api/portfolio/featured
 * @access  Public
 */
exports.getFeaturedPortfolio = async (req, res) => {
    try {
        const items = await firestoreService.query('portfolio', [
            ['isFeatured', '==', true]
        ], {
            orderBy: ['order', 'asc']
        });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Featured Portfolio Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get portfolio categories
 * @route   GET /api/portfolio/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
    try {
        const items = await firestoreService.getAll('portfolio');
        const categories = [...new Set(items.map(item => item.category))];

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get single portfolio item
 * @route   GET /api/portfolio/:id
 * @access  Public
 */
exports.getPortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await firestoreService.getById('portfolio', id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Get Portfolio Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Create portfolio item
 * @route   POST /api/portfolio
 * @access  Private
 */
exports.createPortfolioItem = async (req, res) => {
    try {
        const { title, description, imageUrl, category, tags, isFeatured, isActive, order, reelLink, viewsCount } = req.body;

        if (!title || !category || (!imageUrl && !reelLink)) {
            return res.status(400).json({
                success: false,
                message: 'Title, category, and either image URL or reel link are required'
            });
        }

        const item = await firestoreService.create('portfolio', {
            title,
            description: description || '',
            imageUrl,
            category,
            tags: tags || [],
            isFeatured: isFeatured || false,
            isActive: isActive !== undefined ? isActive : true,
            order: order || 0,
            reelLink: reelLink || '',
            viewsCount: viewsCount || 0
        });

        res.status(201).json({
            success: true,
            message: 'Portfolio item created successfully',
            data: item
        });
    } catch (error) {
        console.error('Create Portfolio Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update portfolio item
 * @route   PUT /api/portfolio/:id
 * @access  Private
 */
exports.updatePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, category, tags, isFeatured, isActive, order, reelLink, viewsCount } = req.body;

        const existingItem = await firestoreService.getById('portfolio', id);
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio item not found'
            });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (category !== undefined) updateData.category = category;
        if (tags !== undefined) updateData.tags = tags;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (order !== undefined) updateData.order = order;
        if (reelLink !== undefined) updateData.reelLink = reelLink;
        if (viewsCount !== undefined) updateData.viewsCount = viewsCount;

        const item = await firestoreService.update('portfolio', id, updateData);

        res.status(200).json({
            success: true,
            message: 'Portfolio item updated successfully',
            data: item
        });
    } catch (error) {
        console.error('Update Portfolio Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete portfolio item
 * @route   DELETE /api/portfolio/:id
 * @access  Private
 */
exports.deletePortfolioItem = async (req, res) => {
    try {
        const { id } = req.params;

        const existingItem = await firestoreService.getById('portfolio', id);
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio item not found'
            });
        }

        await firestoreService.delete('portfolio', id);

        res.status(200).json({
            success: true,
            message: 'Portfolio item deleted successfully'
        });
    } catch (error) {
        console.error('Delete Portfolio Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
