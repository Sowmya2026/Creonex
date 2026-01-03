const admin = require('firebase-admin');
const path = require('path');

// Path to service account key
const serviceAccountPath = path.join(__dirname, '../config/creonexviz-837f2-firebase-adminsdk-fbsvc-9bd878edc9.json');

const clearContacts = async () => {
    try {
        console.log('🧹 Starting cleanup of Inquiries (Contacts) using Admin SDK...\n');

        // Initialize Firebase Admin
        try {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (err) {
            console.error('Failed to load service account or initialize app:', err.message);
            console.error('Make sure the key file exists at:', serviceAccountPath);
            process.exit(1);
        }

        const db = admin.firestore();
        const contactsRef = db.collection('contacts');

        // Get all documents
        const snapshot = await contactsRef.get();

        if (snapshot.empty) {
            console.log('✨ No inquiries found to delete.');
            process.exit(0);
        }

        console.log(`Found ${snapshot.size} inquiries. Deleting in batch...`);

        // Batch delete (limit 500 per batch)
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        console.log(`\n✅ Successfully deleted ${snapshot.size} inquiries.`);
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Cleanup failed:', error);
        process.exit(1);
    }
};

clearContacts();
