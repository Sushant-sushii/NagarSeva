const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
    createComplaint,
    getComplaintById,
    getAllComplaints,
    getComplaintsByUserId,
    getComplaintsNearLocation,
    updateComplaintStatus,
    updateComplaint,
    deleteComplaint,
    getComplaintStats
} = require('../controllers/complain.controller');

/**
 * Public routes (no authentication required)
 */

// GET all complaints with filters and pagination
router.get('/', getAllComplaints);

// GET single complaint by ID
router.get('/:id', getComplaintById);

// GET complaints near a location (geospatial query)
router.get('/nearby/:latitude/:longitude/:radius', getComplaintsNearLocation);

// GET ward statistics
router.get('/stats/:wardNumber', getComplaintStats);

/**
 * Protected routes (authentication required)
 */

// POST create new complaint (citizen)
router.post('/create', authMiddleware, createComplaint);

// GET complaints filed by specific user
router.get('/user/:userId', authMiddleware, getComplaintsByUserId);

// PUT update complaint status (official/admin)
router.put('/:id/status', authMiddleware, updateComplaintStatus);

// PUT update complaint (official/admin)
router.put('/:id', authMiddleware, updateComplaint);

// DELETE complaint
router.delete('/:id', authMiddleware, deleteComplaint);

module.exports = router;
