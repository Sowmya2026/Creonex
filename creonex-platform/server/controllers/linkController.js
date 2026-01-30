const firestoreService = require('../services/firestore.service');

/**
 * @desc    Get all links (public)
 * @route   GET /api/links
 * @access  Public
 */
exports.getLinks = async (req, res) => {
    try {
        const items = await firestoreService.getAll('links', {
            orderBy: ['order', 'asc']
        });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Links Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get single link item
 * @route   GET /api/links/:id
 * @access  Public
 */
exports.getLinkItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await firestoreService.getById('links', id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Link item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Get Link Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Create link item
 * @route   POST /api/links
 * @access  Private
 */
exports.createLinkItem = async (req, res) => {
    try {
        const { title, url, imageUrl, price, rating, description, isActive, order } = req.body;

        if (!title || !url) {
            return res.status(400).json({
                success: false,
                message: 'Title and URL are required'
            });
        }

        const item = await firestoreService.create('links', {
            title,
            url,
            imageUrl: imageUrl || '',
            price: price || '',
            rating: rating ? parseFloat(rating) : 0,
            description: description || '',
            isActive: isActive !== undefined ? isActive : true,
            order: order || 0
        });

        res.status(201).json({
            success: true,
            message: 'Link item created successfully',
            data: item
        });
    } catch (error) {
        console.error('Create Link Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update link item
 * @route   PUT /api/links/:id
 * @access  Private
 */
exports.updateLinkItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url, imageUrl, price, rating, description, isActive, order } = req.body;

        const existingItem = await firestoreService.getById('links', id);
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Link item not found'
            });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (url !== undefined) updateData.url = url;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (price !== undefined) updateData.price = price;
        if (rating !== undefined) updateData.rating = parseFloat(rating);
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (order !== undefined) updateData.order = order;

        const item = await firestoreService.update('links', id, updateData);

        res.status(200).json({
            success: true,
            message: 'Link item updated successfully',
            data: item
        });
    } catch (error) {
        console.error('Update Link Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const axios = require('axios');

/**
 * @desc    Fetch metadata from URL
 * @route   POST /api/links/meta
 * @access  Private
 */
exports.getMetaData = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        // Add protocol if missing
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
        });

        const html = response.data;

        // Simple regex to extract og:tags
        const getMetaContent = (prop) => {
            const regex = new RegExp(`<meta property="${prop}" content="([^"]+)"`, 'i');
            const match = html.match(regex);
            if (match) return match[1];

            // Try name attribute if property fails
            const regexName = new RegExp(`<meta name="${prop}" content="([^"]+)"`, 'i');
            const matchName = html.match(regexName);
            return matchName ? matchName[1] : null;
        };

        const title = getMetaContent('og:title') || getMetaContent('title') || '';
        const description = getMetaContent('og:description') || getMetaContent('description') || '';
        const imageUrl = getMetaContent('og:image') || '';

        // Amazon specific price attempt (very fragile, but better than nothing)
        let price = '';
        const priceRegex = /<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)<\/span>/;
        const priceMatch = html.match(priceRegex);
        if (priceMatch) {
            price = priceMatch[1].trim();
            // Add symbol if missing
            if (!price.includes('$') && !price.includes('₹')) {
                // Check currency
                const currencyRegex = /<span[^>]*class="[^"]*a-price-symbol[^"]*"[^>]*>([^<]+)<\/span>/;
                const currencyMatch = html.match(currencyRegex);
                const symbol = currencyMatch ? currencyMatch[1] : '$';
                price = symbol + price;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                title: title.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
                description: description.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
                imageUrl,
                price
            }
        });

    } catch (error) {
        console.error('Fetch Meta Error:', error.message);
        // Don't fail the request, just return empty data so manual entry is possible
        res.status(200).json({
            success: true,
            message: 'Could not fetch metadata automatically',
            data: {}
        });
    }
};

/**
 * @desc    Delete link item
 * @route   DELETE /api/links/:id
 * @access  Private
 */
exports.deleteLinkItem = async (req, res) => {
    try {
        const { id } = req.params;

        const existingItem = await firestoreService.getById('links', id);
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Link item not found'
            });
        }

        await firestoreService.delete('links', id);

        res.status(200).json({
            success: true,
            message: 'Link item deleted successfully'
        });
    } catch (error) {
        console.error('Delete Link Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
