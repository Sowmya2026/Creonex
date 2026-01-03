const firestoreService = require('../services/firestore.service');

/**
 * @desc    Get all catalog inquiries (admin)
 * @route   GET /api/catalog-inquiries/admin/all
 * @access  Private
 */
exports.getAdminInquiries = async (req, res) => {
    try {
        const items = await firestoreService.getAll('catalog_inquiries', {
            orderBy: ['createdAt', 'desc']
        });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Admin Inquiries Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Create new catalog inquiry
 * @route   POST /api/catalog-inquiries
 * @access  Public
 */
exports.createInquiry = async (req, res) => {
    try {
        const { name, email, phone, catalogId, catalogTitle, message } = req.body;

        const newItem = {
            name,
            email,
            phone,
            catalogId,
            catalogTitle,
            message,
            status: 'New',
            createdAt: new Date().toISOString()
        };

        const result = await firestoreService.create('catalog_inquiries', newItem);

        res.status(201).json({
            success: true,
            data: { id: result.id, ...newItem }
        });
    } catch (error) {
        console.error('Create Inquiry Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update inquiry status
 * @route   PUT /api/catalog-inquiries/:id
 * @access  Private
 */
exports.updateInquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;

        await firestoreService.update('catalog_inquiries', req.params.id, {
            status,
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: 'Inquiry status updated'
        });
    } catch (error) {
        console.error('Update Inquiry Status Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete catalog inquiry
 * @route   DELETE /api/catalog-inquiries/:id
 * @access  Private
 */
exports.deleteInquiry = async (req, res) => {
    try {
        await firestoreService.delete('catalog_inquiries', req.params.id);

        res.status(200).json({
            success: true,
            message: 'Inquiry deleted'
        });
    } catch (error) {
        console.error('Delete Inquiry Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
