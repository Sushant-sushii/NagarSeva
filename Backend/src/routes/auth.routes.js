const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile, 
    logoutUser 
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateUpdate } = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, validateUpdate, updateUserProfile);
router.post('/logout', authMiddleware, logoutUser);

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Auth service is healthy"
    });
});

module.exports = router;
