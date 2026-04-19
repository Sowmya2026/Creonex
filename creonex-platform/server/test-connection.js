const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const testFirebase = async () => {
    try {
        console.log('Starting Firebase connection test...');
        
        const serviceAccountPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        console.log(`Loading service account from: ${serviceAccountPath}`);
        
        const serviceAccount = require(serviceAccountPath);
        console.log(`Project ID: ${serviceAccount.project_id}`);
        console.log(`Client Email: ${serviceAccount.client_email}`);

        // Handle private key formatting
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const db = admin.firestore();
        console.log('Attempting to list collections...');
        const collections = await db.listCollections();
        console.log('✅ Successfully connected to Firestore!');
        console.log(`Found ${collections.length} collections.`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Firestore Connection Failed:');
        console.error(error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
};

testFirebase();
