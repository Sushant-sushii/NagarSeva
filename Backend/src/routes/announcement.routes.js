const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { upload, uploadToImageKit } = require('../middleware/imageUpload.middleware');
const {
  getAllAnnouncements,
  createAnnouncement
} = require('../controllers/announcement.controller');

// GET all announcements (public)
router.get('/', getAllAnnouncements);

// POST create new announcement (official/admin)
router.post('/create', authMiddleware, createAnnouncement);

// POST upload announcement image (official/admin)
router.post('/upload-image', authMiddleware, upload, uploadToImageKit, (req, res) => {
  return res.status(200).json({
    success: true,
    imageUrl: req.imageUrl
  });
});

module.exports = router;
