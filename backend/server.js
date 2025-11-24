const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Use PostgreSQL database
const { initializeDatabase } = require('./database-postgres');

// Import routes
const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registrations');
const communityRoutes = require('./routes/community');
const userRoutes = require('./routes/users');
const announcementRoutes = require('./routes/announcements');
const exchangeRateRoutes = require('./routes/exchangeRates');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/exchange-rates', exchangeRateRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Kimberly Signature Scents API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Initialize database tables
        await initializeDatabase();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║   🌟 Kimberly Signature Scents API Server 🌟          ║
    ║                                                        ║
    ║   Server running on: http://localhost:${PORT}         ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
    ║                                                        ║
    ║   📱 Ready to accept requests!                        ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
