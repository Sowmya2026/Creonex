const firestoreService = require('../services/firestore.service');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res) => {
    try {
        const services = await firestoreService.getAll('services', {
            orderBy: ['order', 'asc']
        });

        // Filter only active services for public access
        const activeServices = services.filter(service => service.isActive !== false);

        res.status(200).json({
            success: true,
            count: activeServices.length,
            data: activeServices
        });
    } catch (error) {
        console.error('Get Services Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all services (including inactive) - Admin only
 * @route   GET /api/services/all
 * @access  Private
 */
exports.getAllServices = async (req, res) => {
    try {
        const services = await firestoreService.getAll('services', {
            orderBy: ['order', 'asc']
        });

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error('Get All Services Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get single service
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await firestoreService.getById('services', id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error('Get Service Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Private
 */
exports.createService = async (req, res) => {
    try {
        const { title, description, icon, image, category, features, price, isActive, order } = req.body;

        // Validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        const service = await firestoreService.create('services', {
            title,
            description,
            icon: icon || 'Package',
            image: image || '',
            category: category || 'general',
            features: features || [],
            price: price || null,
            isActive: isActive !== false,
            order: order || 0
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });
    } catch (error) {
        console.error('Create Service Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private
 */
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, icon, image, category, features, price, isActive, order } = req.body;

        // Check if service exists
        const existingService = await firestoreService.getById('services', id);
        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        if (icon !== undefined) updateData.icon = icon;
        if (image !== undefined) updateData.image = image;
        if (category !== undefined) updateData.category = category;
        if (features !== undefined) updateData.features = features;
        if (price !== undefined) updateData.price = price;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (order !== undefined) updateData.order = order;

        const service = await firestoreService.update('services', id, updateData);

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });
    } catch (error) {
        console.error('Update Service Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private
 */
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if service exists
        const existingService = await firestoreService.getById('services', id);
        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        await firestoreService.delete('services', id);

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Delete Service Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
