const { db } = require('../config/firebase-admin');

/**
 * Visitor Model (Firebase Edition)
 * Represents a visitor tracked on the website
 */

const visitorSchema = {
    ip: String,
    userAgent: String,
    visitCount: Number,
    firstVisit: Date,
    lastVisit: Date,
    visits: Array // Array of { page: string, timestamp: Date }
};

module.exports = {
    collection: 'visitors',
    schema: visitorSchema
};
