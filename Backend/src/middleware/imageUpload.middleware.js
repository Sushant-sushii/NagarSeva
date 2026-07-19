const multer = require('multer');
const { uploadImage } = require('../services/storage.services');

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit
});

// Middleware to upload file to ImageKit using the storage service
const uploadToImageKit = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  try {
    const file = req.file;
    // Convert buffer to base64 string for ImageKit upload
    const base64File = file.buffer.toString('base64');
    
    const imageUrl = await uploadImage(base64File);
    req.imageUrl = imageUrl;
    next();
  } catch (error) {
    console.error('ImageKit upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image to ImageKit',
      error: error.message
    });
  }
};

module.exports = {
  upload: upload.single('image'),
  uploadToImageKit
};
