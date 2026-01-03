const { auth, db } = require('../config/firebase-admin');

/**
 * @desc    Login user with Firebase Auth
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Note: Firebase Admin SDK doesn't support password authentication directly
        // We need to use Firebase Client SDK on frontend or create custom tokens
        // For now, we'll verify the user exists and create a custom token

        try {
            const userRecord = await auth.getUserByEmail(email);

            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(userRecord.uid).get();

            if (!userDoc.exists) {
                return res.status(401).json({ message: 'User not found in database' });
            }

            const userData = userDoc.data();

            // Create custom token
            const customToken = await auth.createCustomToken(userRecord.uid);

            // Update last login
            await db.collection('users').doc(userRecord.uid).update({
                lastLogin: new Date()
            });

            res.json({
                uid: userRecord.uid,
                email: userRecord.email,
                role: userData.role,
                token: customToken,
                message: 'Login successful'
            });

        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            throw error;
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Register a new user (admin only)
 * @route   POST /api/auth/register
 * @access  Public (should be protected in production)
 */
exports.registerUser = async (req, res) => {
    try {
        const { email, password, role = 'admin' } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            emailVerified: false
        });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email,
            role,
            createdAt: new Date(),
            lastLogin: null
        });

        // Create custom token
        const customToken = await auth.createCustomToken(userRecord.uid);

        res.status(201).json({
            uid: userRecord.uid,
            email: userRecord.email,
            role,
            token: customToken,
            message: 'User created successfully'
        });

    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ message: 'User already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Verify Firebase token
 * @route   GET /api/auth/verify
 * @access  Private
 */
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            uid: decodedToken.uid,
            email: decodedToken.email,
            ...userDoc.data()
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        res.json(req.user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: error.message });
    }
};
