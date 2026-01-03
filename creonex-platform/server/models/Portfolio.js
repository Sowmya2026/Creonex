const { db } = require('../config/firebase-admin');

/**
 * Portfolio Model
 * Represents a portfolio item/image
 */

const portfolioSchema = {
    title: String,
    description: String,
    imageUrl: String, // URL to the image
    category: String, // e.g., 'catalog', 'customization', 'wedding', 'birthday'
    tags: Array, // Array of tag strings
    isFeatured: Boolean,
    isActive: Boolean, // Whether the item is visible on the client website
    order: Number,
    createdAt: Date,
    updatedAt: Date
};

module.exports = {
    collection: 'portfolio',
    schema: portfolioSchema
};
