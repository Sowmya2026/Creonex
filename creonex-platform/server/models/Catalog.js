const { db } = require('../config/firebase-admin');

/**
 * Catalog Model
 * Represents a catalog design PDF for sale
 */

const catalogSchema = {
    title: String,
    description: String,
    price: Number,
    pageCount: Number,
    coverImageUrl: String, // URL to the cover image
    isActive: Boolean, // Whether the item is visible on the client website
    createdAt: Date,
    updatedAt: Date
};

module.exports = {
    collection: 'catalogs',
    schema: catalogSchema
};
