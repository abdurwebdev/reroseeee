const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

// Get purchased courses
router.get("/purchased-courses", protect, studentController.getPurchasedCourses);

// Purchase a course
router.post("/purchase-course/:courseId", protect, studentController.purchaseCourse);

// Get course videos
router.get("/course/:courseId", protect, studentController.getCourseVideos);

module.exports = router;
