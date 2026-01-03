const admin = require('firebase-admin');
const path = require('path');

let firebaseApp;

const initializeFirebase = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Option 1: Use service account file (recommended for production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
            const serviceAccount = require(serviceAccountPath);
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
            });
            console.log('✅ Firebase Admin initialized with service account file');
        }
        // Option 2: Use environment variables (easier for development)
        else if (process.env.FIREBASE_PROJECT_ID) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                }),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
            });
            console.log('✅ Firebase Admin initialized with environment variables');
        }
        // Option 3: Use default credentials (for Google Cloud environments)
        else {
            firebaseApp = admin.initializeApp();
            console.log('✅ Firebase Admin initialized with default credentials');
        }

        return firebaseApp;
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
        throw error;
    }
};

// Initialize Firebase
initializeFirebase();

// Export Firestore, Auth, and Storage instances
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

// Firestore settings
db.settings({
    ignoreUndefinedProperties: true
});

module.exports = {
    admin,
    db,
    auth,
    bucket,
    firebaseApp
};
