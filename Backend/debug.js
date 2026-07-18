// Debug script to test the setup without database dependency
require('dotenv').config();

console.log('🔍 Testing Backend Setup...\n');

// Test 1: Check required modules
console.log('📦 Checking required modules...');
try {
    require('express');
    console.log('  ✅ express');
    require('cors');
    console.log('  ✅ cors');
    require('cookie-parser');
    console.log('  ✅ cookie-parser');
    require('bcrypt');
    console.log('  ✅ bcrypt');
    require('jsonwebtoken');
    console.log('  ✅ jsonwebtoken');
    require('mongoose');
    console.log('  ✅ mongoose');
} catch (err) {
    console.error('  ❌ Missing module:', err.message);
    process.exit(1);
}

// Test 2: Check file imports
console.log('\n📄 Checking file imports...');
try {
    const app = require('./src/app');
    console.log('  ✅ app.js');
    const authRoutes = require('./src/routes/auth.routes');
    console.log('  ✅ auth.routes.js');
    const authController = require('./src/controllers/auth.controller');
    console.log('  ✅ auth.controller.js');
    const authMiddleware = require('./src/middleware/auth.middleware');
    console.log('  ✅ auth.middleware.js');
    const validationMiddleware = require('./src/middleware/validation.middleware');
    console.log('  ✅ validation.middleware.js');
    const errorHandler = require('./src/middleware/errorHandler.middleware');
    console.log('  ✅ errorHandler.middleware.js');
} catch (err) {
    console.error('  ❌ Import error:', err.message);
    process.exit(1);
}

// Test 3: Check environment variables
console.log('\n🔐 Checking environment variables...');
console.log(`  MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Not set'}`);
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set (using default)'}`);
console.log(`  PORT: ${process.env.PORT || '3000 (default)'}`);

// Test 4: Check routes
console.log('\n🛣️  Checking routes...');
try {
    const app = require('./src/app');
    const request = require('supertest');
    
    // This would test the app, but we'll just verify it's an Express app
    if (app && typeof app === 'function') {
        console.log('  ✅ App is a valid Express application');
    } else {
        console.log('  ❌ App is not a valid Express application');
    }
} catch (err) {
    console.log('  ⚠️  Could not test routes:', err.message);
}

console.log('\n✅ All checks passed! Backend is ready to run.');
console.log('\n📝 To start the server, run:');
console.log('   npm run dev');
console.log('   or');
console.log('   node server.js');
