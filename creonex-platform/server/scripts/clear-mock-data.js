const admin = require('firebase-admin');
const path = require('path');

// Path to service account key
const serviceAccountPath = path.join(__dirname, '../config/creonexviz-837f2-firebase-adminsdk-fbsvc-9bd878edc9.json');

const clearMockData = async () => {
    try {
        console.log('🧹 Starting cleanup of Mock Data (Visitors & Inquiries)...\n');

        // Initialize Firebase Admin
        try {
            const serviceAccount = require(serviceAccountPath);
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }
        } catch (err) {
            console.error('Failed to load service account or initialize app:', err.message);
            console.error('Make sure the key file exists at:', serviceAccountPath);
            process.exit(1);
        }

        const db = admin.firestore();

        // 1. Clear Visitors
        const visitorsRef = db.collection('visitors');
        const visitorsSnapshot = await visitorsRef.get();

        if (!visitorsSnapshot.empty) {
            console.log(`Found ${visitorsSnapshot.size} visitors. Deleting...`);
            const batch = db.batch();
            visitorsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${visitorsSnapshot.size} visitors.`);
        } else {
            console.log('✨ No visitors found.');
        }

        // 2. Clear Inquiries (Contacts)
        const contactsRef = db.collection('contacts');
        const contactsSnapshot = await contactsRef.get();

        if (!contactsSnapshot.empty) {
            console.log(`Found ${contactsSnapshot.size} inquiries. Deleting...`);
            const batch = db.batch();
            contactsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✅ Deleted ${contactsSnapshot.size} inquiries.`);
        } else {
            console.log('✨ No inquiries found.');
        }

        console.log('\n✅ Start fresh! Mock data cleared.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Cleanup failed:', error);
        process.exit(1);
    }
};

clearMockData();
