import { createContext, useState, useContext, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for Firebase to determine if there's a cached session
        const init = async () => {
            if (auth.authStateReady) {
                await auth.authStateReady();
            }
            
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    const token = await firebaseUser.getIdToken();
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        token
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
            
            return unsubscribe;
        };

        const unsubscribePromise = init();
        return () => {
            unsubscribePromise.then(unsub => unsub());
        };
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            // Try to ensure user document exists in Firestore
            try {
                const userRef = doc(db, 'users', userCredential.user.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    await setDoc(userRef, {
                        email: userCredential.user.email,
                        role: 'admin',
                        createdAt: new Date(),
                        lastLogin: new Date()
                    });
                } else {
                    await setDoc(userRef, {
                        lastLogin: new Date()
                    }, { merge: true });
                }
            } catch (fsError) {
                console.warn('Firestore user doc sync failed (likely permission rules):', fsError.message);
                // We still proceed because the Auth itself succeeded
            }

            return {
                success: true,
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    token
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            let message = 'Login failed';

            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    message = 'Invalid email or password';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    message = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    message = error.message;
            }

            return { success: false, message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const token = await userCredential.user.getIdToken();

            // Create/update user document in Firestore
            const userRef = doc(db, 'users', userCredential.user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Create new user document
                await setDoc(userRef, {
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    photoURL: userCredential.user.photoURL,
                    role: 'admin', // You can change this logic as needed
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
            } else {
                // Update last login
                await setDoc(userRef, {
                    lastLogin: new Date()
                }, { merge: true });
            }

            return {
                success: true,
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    photoURL: userCredential.user.photoURL,
                    token
                }
            };
        } catch (error) {
            console.error('Google login error:', error);
            let message = 'Google sign-in failed';

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    message = 'Sign-in popup was closed';
                    break;
                case 'auth/popup-blocked':
                    message = 'Sign-in popup was blocked by browser';
                    break;
                case 'auth/cancelled-popup-request':
                    message = 'Sign-in was cancelled';
                    break;
                default:
                    message = error.message;
            }

            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
