// Firebase Web SDK Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDAMRWsgPkMUdYRC9kL2V48wa6ga7_3Hqc",
    authDomain: "creonexviz-837f2.firebaseapp.com",
    projectId: "creonexviz-837f2",
    storageBucket: "creonexviz-837f2.firebasestorage.app",
    messagingSenderId: "987670035016",
    appId: "1:987670035016:web:ab3c745e4b5053708f67d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
