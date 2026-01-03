const { db } = require('../config/firebase-admin');

/**
 * User Model (Firebase Edition)
 * Represents an admin user in Firebase Auth and Firestore
 */

const userSchema = {
    email: String,
    role: String, // e.g., 'admin'
    lastLogin: Date,
    createdAt: Date
};

module.exports = {
    collection: 'users',
    schema: userSchema
};
