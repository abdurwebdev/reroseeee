const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // Added for ObjectId validation
const Course = require("../models/Course");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dposu9c4n", // Replace with your Cloud Name
  api_key: "985894414217349", // From Cloudinary Dashboard
  api_secret: "XxtR4BBctMIrza_7hNlAJANQBKw", // From Cloudinary Dashboard
});

// Multer storage setup for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "courses", // Store files in a 'courses' folder on Cloudinary
    resource_type: "auto", // Automatically detect file type (image, video, etc.)
    public_id: (req, file) => Date.now() + "-" + file.originalname.split(".")[0], // Unique filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10000 * 1024 * 1024 }, // 1GB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPG, PNG, and MP4 allowed."));
    }
    cb(null, true);
  },
});

// Create Course (Admin Only)
router.post(
  "/create-course",
  protect,
  authorizeRoles("admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos" },
    { name: "thumbnails" },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        instructor,
        duration,
        category,
        videoTitles,
        videoDescriptions
      } = req.body;

      // Extract payment options
      const paymentOptions = {
        jazzCash: req.body['paymentOptions[jazzCash]'] === 'true',
        easyPaisa: req.body['paymentOptions[easyPaisa]'] === 'true',
        payFast: req.body['paymentOptions[payFast]'] === 'true',
        bankTransfer: req.body['paymentOptions[bankTransfer]'] === 'true'
      };

      // Get Cloudinary URLs from uploaded files
      const image = req.files.image ? req.files.image[0].path : null; // Cloudinary URL
      const videoThumbnails = req.files.thumbnails || [];

      const videoFiles = req.files.videos
        ? req.files.videos.map((file, index) => ({
            url: file.path, // Cloudinary URL
            title: Array.isArray(videoTitles) ? videoTitles[index] : videoTitles || "",
            description: Array.isArray(videoDescriptions) ? videoDescriptions[index] : videoDescriptions || "",
            thumbnail: videoThumbnails[index] ? videoThumbnails[index].path : null, // Cloudinary URL
            likes: [],
            dislikes: [],
            comments: [],
          }))
        : [];

      if (!title || !description || !price || !instructor || !duration || !category) {
        return res.status(400).json({ message: "All fields are required." });
      }

      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ message: "Price must be a valid positive number." });
      }

      if (req.files.videos && Array.isArray(videoTitles) && videoTitles.length !== req.files.videos.length) {
        return res.status(400).json({ message: "Number of video titles must match number of videos." });
      }

      const newCourse = new Course({
        title,
        description,
        price,
        instructor,
        duration,
        category,
        image,
        videos: videoFiles,
        paymentOptions
      });

      await newCourse.save();
      res.status(201).json({ message: "Course created successfully", course: newCourse });
    } catch (error) {
      console.error("Error creating course:", error);
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Maximum size is 1GB." });
        }
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  }
);

// Get All Courses with Filters
router.get("/courses", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses with filters:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// Delete Course (Single)
router.delete("/courses/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID format." });
    }

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Delete files from Cloudinary
    if (course.image) {
      const publicId = course.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`courses/${publicId}`);
    }
    for (const video of course.videos) {
      const videoPublicId = video.url.split("/").pop().split(".")[0];
      const thumbnailPublicId = video.thumbnail ? video.thumbnail.split("/").pop().split(".")[0] : null;
      await cloudinary.uploader.destroy(`courses/${videoPublicId}`, { resource_type: "video" });
      if (thumbnailPublicId) await cloudinary.uploader.destroy(`courses/${thumbnailPublicId}`);
    }

    res.status(200).json({ message: "Course deleted successfully." });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

// Delete All Courses
router.delete("/courses", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    // Fetch all courses to delete associated Cloudinary files
    const courses = await Course.find({});
    for (const course of courses) {
      if (course.image) {
        const publicId = course.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`courses/${publicId}`);
      }
      for (const video of course.videos) {
        const videoPublicId = video.url.split("/").pop().split(".")[0];
        const thumbnailPublicId = video.thumbnail ? video.thumbnail.split("/").pop().split(".")[0] : null;
        await cloudinary.uploader.destroy(`courses/${videoPublicId}`, { resource_type: "video" });
        if (thumbnailPublicId) await cloudinary.uploader.destroy(`courses/${thumbnailPublicId}`);
      }
    }

    await Course.deleteMany({});
    res.status(200).json({ message: "All courses deleted successfully." });
  } catch (error) {
    console.error("Error deleting all courses:", error);
    res.status(500).json({ message: "Failed to delete all courses" });
  }
});

// Update Course
router.put(
  "/courses/:id",
  protect,
  authorizeRoles("admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos" },
    { name: "thumbnails" },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        price,
        instructor,
        duration,
        category,
        videoTitles,
        videoDescriptions
      } = req.body;

      // Extract payment options
      const paymentOptions = {
        jazzCash: req.body['paymentOptions[jazzCash]'] === 'true',
        easyPaisa: req.body['paymentOptions[easyPaisa]'] === 'true',
        payFast: req.body['paymentOptions[payFast]'] === 'true',
        bankTransfer: req.body['paymentOptions[bankTransfer]'] === 'true'
      };

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid course ID format." });
      }

      const image = req.files.image ? req.files.image[0].path : null; // Cloudinary URL
      const videoThumbnails = req.files.thumbnails || [];

      const newVideos = req.files.videos
        ? req.files.videos.map((file, index) => ({
            url: file.path, // Cloudinary URL
            title: Array.isArray(videoTitles) ? videoTitles[index] : videoTitles || "",
            description: Array.isArray(videoDescriptions) ? videoDescriptions[index] : videoDescriptions || "",
            thumbnail: videoThumbnails[index] ? videoThumbnails[index].path : null, // Cloudinary URL
            likes: [],
            dislikes: [],
            comments: [],
          }))
        : [];

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }

      course.title = title || course.title;
      course.description = description || course.description;
      course.price = price && !isNaN(price) && price > 0 ? price : course.price;
      course.instructor = instructor || course.instructor;
      course.duration = duration || course.duration;
      course.category = category || course.category;

      // Update payment options
      if (course.paymentOptions) {
        course.paymentOptions.jazzCash = paymentOptions.jazzCash;
        course.paymentOptions.easyPaisa = paymentOptions.easyPaisa;
        course.paymentOptions.payFast = paymentOptions.payFast;
        course.paymentOptions.bankTransfer = paymentOptions.bankTransfer;
      } else {
        course.paymentOptions = paymentOptions;
      }

      if (image) course.image = image;
      if (newVideos.length > 0) {
        course.videos = [...course.videos, ...newVideos];
      }

      await course.save();
      res.status(200).json({ message: "Course updated successfully.", course });
    } catch (error) {
      console.error("Error updating course:", error);
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Maximum size is 1GB." });
        }
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update course." });
    }
  }
);

// Get Course Details
router.get("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID format." });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "Failed to fetch course details" });
  }
});

module.exports = router;