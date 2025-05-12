const express = require('express');
const router = express.Router();
const codingVideoController = require('../controllers/codingVideoController');
const { protect } = require('../middleware/authMiddleware');
const { isProfessionalCoder, validateCodeSnippet } = require('../middleware/coderMiddleware');
const { checkUploadPermission } = require('../middleware/uploadPermissionMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dposu9c4n",
  api_key: "985894414217349",
  api_secret: "XxtR4BBctMIrza_7hNlAJANQBKw",
});

// Define Cloudinary storage configuration for coding videos
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: isVideo ? 'coding_videos' : 'coding_thumbnails',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      // Add coding-specific transformation options
      transformation: isVideo ? [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ] : [
        { width: 1280, height: 720, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    };
  }
});

// Define file filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    // Allow only high-quality video formats for coding videos
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid video format. Only MP4, WebM, and QuickTime formats are allowed.'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    // Allow only high-quality image formats for thumbnails
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid image format. Only JPEG, PNG, and WebP formats are allowed.'), false);
    }
  } else {
    return cb(new Error('Unexpected field name'), false);
  }
  cb(null, true);
};

// Create Multer upload middleware with higher limits for coding videos
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for coding videos
  },
  fileFilter,
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

// Handle upload middleware errors
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 500MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Public routes - All videos are accessible to everyone for free learning
router.get('/feed', codingVideoController.getCodingVideosFeed);
router.get('/trending', codingVideoController.getTrendingCodingVideos);
router.get('/recommended', codingVideoController.getRecommendedCodingVideos);
router.get('/latest', codingVideoController.getLatestCodingVideos);

// Check if user can upload coding videos
router.get('/check-upload-permission', protect, checkUploadPermission);

// Routes for specific videos - must come after other specific routes to avoid conflicts
router.get('/:id', codingVideoController.getCodingVideoById);

// Interaction routes (require authentication)
router.post('/:id/like', protect, codingVideoController.likeCodingVideo);
router.post('/:id/dislike', protect, codingVideoController.dislikeCodingVideo);
router.post('/:id/comments', protect, codingVideoController.addComment);
router.post('/:id/comments/:commentId/replies', protect, codingVideoController.addReply);

// Protected routes for professional coders
router.post(
  '/upload',
  protect,
  isProfessionalCoder,
  handleUpload,
  validateCodeSnippet,
  codingVideoController.uploadCodingVideo
);

// Upload coding short
router.post(
  '/upload-short',
  protect,
  isProfessionalCoder,
  handleUpload,
  validateCodeSnippet,
  codingVideoController.uploadCodingShort
);

module.exports = router;
