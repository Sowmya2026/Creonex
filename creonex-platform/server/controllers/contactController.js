const firestoreService = require('../services/firestore.service');

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
exports.submitContact = async (req, res) => {
    try {
        const { name, email, message, phone, company, type, subject } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required'
            });
        }

        const contact = await firestoreService.create('contacts', {
            name,
            email,
            message,
            phone: phone || null,
            company: company || null,
            type: type || 'general', // 'general', 'consultation', 'collaboration'
            subject: subject || null,
            status: 'new',
            read: false
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            id: contact.id
        });
    } catch (error) {
        console.error('Submit Contact Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all contact submissions
 * @route   GET /api/contact
 * @access  Private
 */
exports.getContacts = async (req, res) => {
    try {
        const contacts = await firestoreService.getAll('contacts', {
            orderBy: ['createdAt', 'desc']
        });

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Get Contacts Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Mark contact as read
 * @route   PATCH /api/contact/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await firestoreService.update('contacts', id, {
            read: true,
            status: 'read'
        });

        res.status(200).json({
            success: true,
            message: 'Contact marked as read',
            contact
        });
    } catch (error) {
        console.error('Mark As Read Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Mark all unread contacts as read
 * @route   PATCH /api/contact/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        // Query all unread contacts
        const unreadContacts = await firestoreService.query('contacts', [['read', '==', false]]);

        if (unreadContacts.length === 0) {
            return res.status(200).json({ success: true, message: 'No unread contacts' });
        }

        // Prepare batch operations
        const operations = unreadContacts.map(contact => ({
            type: 'update',
            collection: 'contacts',
            id: contact.id,
            data: {
                read: true,
                status: 'read',
                updatedAt: new Date()
            }
        }));

        await firestoreService.batchWrite(operations);

        res.status(200).json({
            success: true,
            message: `${unreadContacts.length} contacts marked as read`
        });
    } catch (error) {
        console.error('Mark All As Read Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update contact (status, etc.)
 * @route   PATCH /api/contact/:id
 * @access  Private
 */
exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Only allow certain fields to be updated
        const allowedFields = ['status', 'read', 'notes'];
        const filteredData = {};

        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        if (Object.keys(filteredData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        const contact = await firestoreService.update('contacts', id, filteredData);

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            contact
        });
    } catch (error) {
        console.error('Update Contact Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete contact
 * @route   DELETE /api/contact/:id
 * @access  Private
 */
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        await firestoreService.delete('contacts', id);

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Delete Contact Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
