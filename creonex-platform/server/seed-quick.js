// Quick seed script using Firebase Web SDK
// This doesn't require service account credentials

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDAMRWsgPkMUdYRC9kL2V48wa6ga7_3Hqc",
    authDomain: "creonexviz-837f2.firebaseapp.com",
    projectId: "creonexviz-837f2",
    storageBucket: "creonexviz-837f2.firebasestorage.app",
    messagingSenderId: "987670035016",
    appId: "1:987670035016:web:ab3c745e4b5053708f67d"
};

const seedQuick = async () => {
    try {
        console.log('🌱 Starting quick Firebase seed...\n');

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        const adminEmail = 'admin@creonex.viz';
        const adminPassword = 'password123';

        console.log('👤 Creating admin user...');

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            const user = userCredential.user;

            console.log('✅ Admin user created in Firebase Auth');
            console.log(`   UID: ${user.uid}\n`);

            // Create user document in Firestore
            console.log('📄 Creating admin user document in Firestore...');
            await setDoc(doc(db, 'users', user.uid), {
                email: adminEmail,
                role: 'admin',
                createdAt: new Date(),
                lastLogin: null
            });

            console.log('✅ Admin user document created in Firestore\n');

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log('ℹ️  Admin user already exists!\n');
            } else {
                throw error;
            }
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Admin Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✅ Seed completed successfully!\n');
        console.log('🚀 You can now login at: http://localhost:5173/login\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed!');
        console.error('Error:', error.message);
        console.error('\n🔍 Make sure:');
        console.error('   1. Firebase Authentication is enabled');
        console.error('   2. Email/Password provider is enabled');
        console.error('   3. Firestore database is created\n');
        process.exit(1);
    }
};

seedQuick();
