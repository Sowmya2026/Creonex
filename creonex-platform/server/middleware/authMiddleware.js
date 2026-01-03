const { auth, db } = require('../config/firebase-admin');

/**
 * Protect routes - Verify Firebase ID token
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token with Firebase Admin SDK
            const decodedToken = await auth.verifyIdToken(token);

            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(decodedToken.uid).get();

            if (!userDoc.exists) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Attach user to request
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                ...userDoc.data()
            };

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Admin only middleware
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { protect, admin };
