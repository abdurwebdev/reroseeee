const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary (use environment variables for security)
cloudinary.config({
  cloud_name: "dposu9c4n",
  api_key: "985894414217349",
  api_secret: "XxtR4BBctMIrza_7hNlAJANQBKw",
});

// Define Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith("video");
    return {
      folder: isVideo ? "free_videos" : "thumbnails",
      resource_type: isVideo ? "video" : "image",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// Define file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("❌ Invalid file type. Only JPG, PNG, and MP4 formats are allowed."), false);
  }
  cb(null, true);
};

// Create Multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Max file size: 50MB
  },
  fileFilter,
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

module.exports = upload;
