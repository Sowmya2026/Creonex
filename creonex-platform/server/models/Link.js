const { db } = require('../config/firebase-admin');

/**
 * Link Model
 * Represents an affiliate link or product link
 */

const linkSchema = {
    title: String,
    url: String, // The affiliate link
    imageUrl: String,
    price: String, // Optional price string (e.g., "$25.00")
    rating: Number, // Rating out of 5 (e.g., 4.5)
    description: String,
    isActive: Boolean,
    order: Number,
    createdAt: Date,
    updatedAt: Date
};

module.exports = {
    collection: 'links',
    schema: linkSchema
};
