// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set up storage for videos, shorts, and thumbnails
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      // Store videos and shorts in different folders based on type
      const type = req.body.type;
      const folder = type === 'short' ? 'uploads/shorts' : 'uploads/videos';
      cb(null, folder);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mov|jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb('Error: Invalid file type!');
  },
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

module.exports = { upload };