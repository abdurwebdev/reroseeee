const User = require("../models/User");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// Get purchased courses for the logged-in student
const getPurchasedCourses = async (req, res) => {
  try {
    // Fetch the logged-in user from the request (from protect middleware)
    const userId = req.user._id;

    // Find the user and populate their purchasedCourses
    const user = await User.findById(userId).populate("purchasedCourses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the purchased courses
    res.status(200).json(user.purchasedCourses);
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Purchase a course
const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user has already purchased this course
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if course is already in user's purchased courses
    if (user.purchasedCourses.includes(courseId)) {
      return res.status(400).json({ message: "Course already purchased" });
    }

    // Add course to user's purchased courses
    user.purchasedCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: "Course purchased successfully" });
  } catch (error) {
    console.error("Error purchasing course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get course videos for a specific course
const getCourseVideos = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has purchased this course
    if (!user.purchasedCourses.includes(courseId)) {
      return res.status(403).json({ message: "You have not purchased this course" });
    }

    // Get course with videos
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getPurchasedCourses,
  purchaseCourse,
  getCourseVideos
};
