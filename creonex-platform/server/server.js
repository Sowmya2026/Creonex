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
    'http://localhost:5175',
    'http://localhost:5176',
    'https://creonex.viz.vercel.app',
    'https://creonexviz.vercel.app',
    'https://creonexviz-admin.vercel.app',
    'https://creonex.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Blocked CORS origin:', origin);
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
const linkRoutes = require('./routes/linkRoutes');

app.use('/api/visitors', visitorRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/catalog-inquiries', catalogInquiryRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/invoices', require('./routes/invoiceRoutes'));


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
