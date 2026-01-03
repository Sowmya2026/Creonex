const { db } = require('../config/firebase-admin');

/**
 * Service Model
 * Represents a service offered by Creonex
 */

const serviceSchema = {
    title: String,
    description: String,
    icon: String, // Icon name from lucide-react
    category: String, // e.g., 'customization', 'catalog', 'brand'
    features: Array, // Array of feature strings
    price: String, // Optional price display
    isActive: Boolean,
    order: Number, // For sorting
    createdAt: Date,
    updatedAt: Date
};

module.exports = {
    collection: 'services',
    schema: serviceSchema
};
