const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const creatorCourseController = require("../controllers/creatorCourseController");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dposu9c4n",
  api_key: "985894414217349",
  api_secret: "XxtR4BBctMIrza_7hNlAJANQBKw",
});

// Multer storage setup for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "creator-courses", // Store files in a 'creator-courses' folder on Cloudinary
    resource_type: "auto", // Automatically detect file type (image, video, etc.)
    public_id: (req, file) => Date.now() + "-" + file.originalname.split(".")[0], // Unique filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10000 * 1024 * 1024 }, // 10GB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPG, PNG, and MP4 allowed."));
    }
    cb(null, true);
  },
});

// Create a new course (Creator Only)
router.post(
  "/create",
  protect,
  authorizeRoles("creator"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos" },
    { name: "thumbnails" },
  ]),
  creatorCourseController.createCourse
);

// Get all courses created by the logged-in creator
router.get(
  "/my-courses",
  protect,
  authorizeRoles("creator"),
  creatorCourseController.getCreatorCourses
);

// Get a specific course by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("creator"),
  creatorCourseController.getCourseById
);

// Update a course
router.put(
  "/:id",
  protect,
  authorizeRoles("creator"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos" },
    { name: "thumbnails" },
  ]),
  creatorCourseController.updateCourse
);

// Delete a course
router.delete(
  "/:id",
  protect,
  authorizeRoles("creator"),
  creatorCourseController.deleteCourse
);

// Submit a course for review
router.post(
  "/:id/submit",
  protect,
  authorizeRoles("creator"),
  creatorCourseController.submitCourseForReview
);

// Add a comment to a course video
router.post(
  "/:courseId/videos/:videoIndex/comment",
  protect,
  creatorCourseController.addComment
);

// Add a reply to a comment
router.post(
  "/:courseId/videos/:videoIndex/comments/:commentId/reply",
  protect,
  creatorCourseController.addReply
);

// Like a video
router.post(
  "/:courseId/videos/:videoIndex/like",
  protect,
  creatorCourseController.likeVideo
);

// Dislike a video
router.post(
  "/:courseId/videos/:videoIndex/dislike",
  protect,
  creatorCourseController.dislikeVideo
);

module.exports = router;
