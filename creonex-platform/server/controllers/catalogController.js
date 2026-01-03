const firestoreService = require('../services/firestore.service');

/**
 * @desc    Get all catalog items (admin)
 * @route   GET /api/catalogs/admin/all
 * @access  Private
 */
exports.getAdminCatalogs = async (req, res) => {
    try {
        const items = await firestoreService.getAll('catalogs', {
            orderBy: ['createdAt', 'desc']
        });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Admin Catalogs Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all active catalog items (public)
 * @route   GET /api/catalogs
 * @access  Public
 */
exports.getCatalogs = async (req, res) => {
    try {
        // Query without orderBy to avoid needing a composite index
        const items = await firestoreService.getAll('catalogs', {
            where: [['isActive', '==', true]]
        });

        // Sort in memory (descending order by createdAt)
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Catalogs Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get single catalog item
 * @route   GET /api/catalogs/:id
 * @access  Public
 */
exports.getCatalog = async (req, res) => {
    try {
        const item = await firestoreService.getById('catalogs', req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Catalog item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Get Catalog Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Create new catalog item
 * @route   POST /api/catalogs
 * @access  Private
 */
exports.createCatalog = async (req, res) => {
    try {
        const { title, description, price, pageCount, coverImageUrl, isActive } = req.body;

        const newItem = {
            title,
            description,
            price: Number(price),
            pageCount: Number(pageCount),
            coverImageUrl,
            isActive: isActive === 'true' || isActive === true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const result = await firestoreService.create('catalogs', newItem);

        res.status(201).json({
            success: true,
            data: { id: result.id, ...newItem }
        });
    } catch (error) {
        console.error('Create Catalog Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update catalog item
 * @route   PUT /api/catalogs/:id
 * @access  Private
 */
exports.updateCatalog = async (req, res) => {
    try {
        const { title, description, price, pageCount, coverImageUrl, isActive } = req.body;

        const updateData = {
            title,
            description,
            price: Number(price),
            pageCount: Number(pageCount),
            updatedAt: new Date().toISOString()
        };

        // Only update file URLs if provided (to allow keeping existing ones)
        if (coverImageUrl) updateData.coverImageUrl = coverImageUrl;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

        await firestoreService.update('catalogs', req.params.id, updateData);

        const updatedItem = await firestoreService.getById('catalogs', req.params.id);

        res.status(200).json({
            success: true,
            data: updatedItem
        });
    } catch (error) {
        console.error('Update Catalog Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete catalog item
 * @route   DELETE /api/catalogs/:id
 * @access  Private
 */
exports.deleteCatalog = async (req, res) => {
    try {
        await firestoreService.delete('catalogs', req.params.id);

        res.status(200).json({
            success: true,
            message: 'Catalog item deleted'
        });
    } catch (error) {
        console.error('Delete Catalog Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
