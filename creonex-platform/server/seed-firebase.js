require('dotenv').config();
const { auth, db } = require('./config/firebase-admin');

const seedFirebase = async () => {
    try {
        console.log('🌱 Starting Firebase seed...\n');

        const adminEmail = 'admin@creonex.viz';
        const adminPassword = 'password123';

        // Check if admin user already exists in Firebase Auth
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(adminEmail);
            console.log('ℹ️  Admin user already exists in Firebase Auth');
            console.log(`   UID: ${userRecord.uid}`);
            console.log(`   Email: ${userRecord.email}\n`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // Create admin user in Firebase Auth
                console.log('👤 Creating admin user in Firebase Auth...');
                userRecord = await auth.createUser({
                    email: adminEmail,
                    password: adminPassword,
                    emailVerified: true
                });
                console.log('✅ Admin user created in Firebase Auth');
                console.log(`   UID: ${userRecord.uid}\n`);
            } else {
                throw error;
            }
        }

        // Check if user document exists in Firestore
        const userDoc = await db.collection('users').doc(userRecord.uid).get();

        if (userDoc.exists) {
            console.log('ℹ️  Admin user document already exists in Firestore\n');
        } else {
            // Create user document in Firestore
            console.log('📄 Creating admin user document in Firestore...');
            await db.collection('users').doc(userRecord.uid).set({
                email: adminEmail,
                role: 'admin',
                createdAt: new Date(),
                lastLogin: null
            });
            console.log('✅ Admin user document created in Firestore\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Admin Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  IMPORTANT: Change this password after first login!\n');
        console.log('✅ Firebase seed completed successfully!\n');
        console.log('🚀 Next step: Start the server with "npm start"\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed!');
        console.error('Error:', error.message);
        console.error('\n🔍 Troubleshooting:');
        console.error('   1. Check if Firebase credentials are configured in .env');
        console.error('   2. Verify Firebase project has Authentication enabled');
        console.error('   3. Ensure Firestore database is created\n');
        process.exit(1);
    }
};

seedFirebase();
