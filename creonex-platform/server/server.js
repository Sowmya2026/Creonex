require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Firebase Admin (this must be done before importing controllers)
require('./config/firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://creonex.vercel.app',
    'https://creonex-admin.vercel.app',
    'https://creonex.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Serve uploaded files as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'Creonex.viz API is running',
        database: 'Firebase Firestore',
        status: 'healthy'
    });
});

// Routes
const visitorRoutes = require('./routes/visitorRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notesRoutes = require('./routes/notesRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const catalogInquiryRoutes = require('./routes/catalogInquiryRoutes');

app.use('/api/visitors', visitorRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/catalog-inquiries', catalogInquiryRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔥 Using Firebase Firestore`);
    console.log(`📡 API: http://localhost:${PORT}\n`);
    console.log(`📚 Catalog Routes Registered`);
    console.log(`📝 Catalog Inquiry Routes Registered`);
});
