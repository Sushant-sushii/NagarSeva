require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

const PORT = process.env.PORT || 3000;


// Start server first (non-blocking)
const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📍 API base URL: http://localhost:${PORT}`);
    console.log(`🔐 Auth routes available at: http://localhost:${PORT}/api/auth`);
});


// Try to connect to database asynchronously (don't block server startup)
(async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.warn('⚠️  No MongoDB URI found in environment variables');
            return;
        }
        await connectDB();
    } catch (err) {
        console.warn('⚠️  Database connection failed:', err.message);
        console.log('ℹ️  Server will continue running without database');
    }
})();

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
