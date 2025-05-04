const User = require("../models/User");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// Get purchased courses for the logged-in student
const getPurchasedCourses = async (req, res) => {
  try {
    // Fetch the logged-in user from the request (from protect middleware)
    const userId = req.user._id;

    // Find the user and populate their purchasedCourses with creator info
    const user = await User.findById(userId).populate({
      path: "purchasedCourses",
      populate: {
        path: "creatorId",
        select: "name profileImageUrl"
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Filter out any unpublished creator courses
    const availableCourses = user.purchasedCourses.filter(course => {
      // Include all admin courses and published creator courses
      return !course.creatorId || course.status === "published";
    });

    // Return the purchased courses
    res.status(200).json({
      success: true,
      courses: availableCourses
    });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Purchase a course
const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // For creator courses, check if it's published
    if (course.creatorId && course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This course is not available for purchase"
      });
    }

    // Check if user has already purchased this course
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if course is already in user's purchased courses
    if (user.purchasedCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course already purchased"
      });
    }

    // Add course to user's purchased courses
    user.purchasedCourses.push(courseId);
    await user.save();

    // If it's a creator course, update creator earnings
    if (course.creatorId) {
      // Find the creator
      const creator = await User.findById(course.creatorId);
      if (creator) {
        // Calculate platform fee (30%)
        const platformFee = course.price * 0.3;
        const creatorEarnings = course.price - platformFee;

        // Update creator earnings
        creator.totalEarnings += creatorEarnings;
        creator.pendingPayout += creatorEarnings;
        await creator.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Course purchased successfully"
    });
  } catch (error) {
    console.error("Error purchasing course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get course videos for a specific course
const getCourseVideos = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has purchased this course
    if (!user.purchasedCourses.includes(courseId)) {
      return res.status(403).json({
        success: false,
        message: "You have not purchased this course"
      });
    }

    // Get course with videos and populate creator info if it's a creator course
    const course = await Course.findById(courseId).populate("creatorId", "name profileImageUrl");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // For creator courses, check if it's published
    if (course.creatorId && course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This course is not available"
      });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error("Error fetching course videos:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  getPurchasedCourses,
  purchaseCourse,
  getCourseVideos
};
