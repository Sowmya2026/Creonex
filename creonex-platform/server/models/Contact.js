const { db } = require('../config/firebase-admin');

/**
 * Contact Model (Firebase Edition)
 * Represents a contact form submission
 */

const contactSchema = {
    name: String,
    email: String,
    message: String,
    status: String, // e.g., 'new', 'read', 'replied'
    createdAt: Date
};

module.exports = {
    collection: 'contacts',
    schema: contactSchema
};
