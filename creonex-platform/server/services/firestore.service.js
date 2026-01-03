const { db } = require('../config/firebase-admin');

/**
 * Firestore Service - Helper functions for Firestore operations
 */

class FirestoreService {
    /**
     * Get a document by ID
     */
    async getById(collection, id) {
        try {
            const doc = await db.collection(collection).doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            throw new Error(`Error getting document: ${error.message}`);
        }
    }

    /**
     * Get all documents in a collection
     */
    async getAll(collection, options = {}) {
        try {
            let query = db.collection(collection);

            // Apply filters
            if (options.where) {
                options.where.forEach(([field, operator, value]) => {
                    query = query.where(field, operator, value);
                });
            }

            // Apply ordering
            if (options.orderBy) {
                const [field, direction = 'asc'] = options.orderBy;
                query = query.orderBy(field, direction);
            }

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error getting documents: ${error.message}`);
        }
    }

    /**
     * Create a new document
     */
    async create(collection, data, customId = null) {
        try {
            const timestamp = new Date();
            const docData = {
                ...data,
                createdAt: timestamp,
                updatedAt: timestamp
            };

            if (customId) {
                await db.collection(collection).doc(customId).set(docData);
                return { id: customId, ...docData };
            } else {
                const docRef = await db.collection(collection).add(docData);
                return { id: docRef.id, ...docData };
            }
        } catch (error) {
            throw new Error(`Error creating document: ${error.message}`);
        }
    }

    /**
     * Update a document
     */
    async update(collection, id, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date()
            };

            await db.collection(collection).doc(id).update(updateData);
            return { id, ...updateData };
        } catch (error) {
            throw new Error(`Error updating document: ${error.message}`);
        }
    }

    /**
     * Delete a document
     */
    async delete(collection, id) {
        try {
            await db.collection(collection).doc(id).delete();
            return { id, deleted: true };
        } catch (error) {
            throw new Error(`Error deleting document: ${error.message}`);
        }
    }

    /**
     * Query documents with custom conditions
     */
    async query(collection, conditions) {
        try {
            let query = db.collection(collection);

            conditions.forEach(condition => {
                const [field, operator, value] = condition;
                query = query.where(field, operator, value);
            });

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error querying documents: ${error.message}`);
        }
    }

    /**
     * Count documents in a collection
     */
    async count(collection, conditions = []) {
        try {
            let query = db.collection(collection);

            conditions.forEach(condition => {
                const [field, operator, value] = condition;
                query = query.where(field, operator, value);
            });

            const snapshot = await query.count().get();
            return snapshot.data().count;
        } catch (error) {
            throw new Error(`Error counting documents: ${error.message}`);
        }
    }

    /**
     * Batch write operations
     */
    async batchWrite(operations) {
        try {
            const batch = db.batch();

            operations.forEach(op => {
                const ref = db.collection(op.collection).doc(op.id);

                switch (op.type) {
                    case 'set':
                        batch.set(ref, op.data);
                        break;
                    case 'update':
                        batch.update(ref, op.data);
                        break;
                    case 'delete':
                        batch.delete(ref);
                        break;
                }
            });

            await batch.commit();
            return { success: true };
        } catch (error) {
            throw new Error(`Error in batch write: ${error.message}`);
        }
    }
}

module.exports = new FirestoreService();
