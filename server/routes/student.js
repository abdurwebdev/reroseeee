const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { protect } = require("../middleware/authMiddleware");
const CallbackRequest = require("../models/CallbackRequest");
// Like a video
router.post("/courses/:courseId/videos/:videoIndex/like", protect, async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;
    const userId = req.user._id; // Assuming protect middleware adds user to req

    const course = await Course.findById(courseId);
    if (!course || videoIndex >= course.videos.length) {
      return res.status(404).json({ message: "Course or video not found" });
    }

    const video = course.videos[videoIndex];

    // Check if user already liked the video
    if (video.likes.includes(userId)) {
      return res.status(400).json({ message: "You have already liked this video" });
    }

    // Remove dislike if user previously disliked it
    if (video.dislikes.includes(userId)) {
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId.toString());
    }

    // Add like
    video.likes.push(userId);
    await course.save();

    res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ message: "Failed to like video" });
  }
});

// Dislike a video
router.post("/courses/:courseId/videos/:videoIndex/dislike", protect, async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course || videoIndex >= course.videos.length) {
      return res.status(404).json({ message: "Course or video not found" });
    }

    const video = course.videos[videoIndex];

    // Check if user already disliked the video
    if (video.dislikes.includes(userId)) {
      return res.status(400).json({ message: "You have already disliked this video" });
    }

    // Remove like if user previously liked it
    if (video.likes.includes(userId)) {
      video.likes = video.likes.filter((id) => id.toString() !== userId.toString());
    }

    // Add dislike
    video.dislikes.push(userId);
    await course.save();

    res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error) {
    console.error("Error disliking video:", error);
    res.status(500).json({ message: "Failed to dislike video" });
  }
});

// Get all courses (already in your code, no change needed)
router.get("/courses", protect, async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// Comment route (unchanged, included for completeness)
router.post("/courses/:courseId/videos/:videoIndex/comment", protect, async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course || videoIndex >= course.videos.length) {
      return res.status(404).json({ message: "Course or video not found" });
    }

    const video = course.videos[videoIndex];
    video.comments.push({ userId, comment });
    await course.save();

    res.status(200).json({ comments: video.comments });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// POST /api/students/request-callback
router.post("/request-callback", async (req, res) => {
  console.log("Callback request endpoint hit"); // ✅ Debug line
  const { name, phone, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required." });
  }

  try {
    const request = new CallbackRequest({ name, phone, message });
    await request.save();
    res.status(200).json({ message: "Callback request saved successfully." });
  } catch (error) {
    console.error("Error saving callback request:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


module.exports = router;








// Delete Course (Single)
// router.delete("/courses/:id", protect, authorizeRoles("admin"), async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid course ID format." });
//     }

//     const course = await Course.findByIdAndDelete(id);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found." });
//     }

//     // Delete files from Cloudinary
//     if (course.image) {
//       const publicId = course.image.split("/").pop().split(".")[0];
//       await cloudinary.uploader.destroy(`courses/${publicId}`);
//     }
//     for (const video of course.videos) {
//       const videoPublicId = video.url.split("/").pop().split(".")[0];
//       const thumbnailPublicId = video.thumbnail ? video.thumbnail.split("/").pop().split(".")[0] : null;
//       await cloudinary.uploader.destroy(`courses/${videoPublicId}`, { resource_type: "video" });
//       if (thumbnailPublicId) await cloudinary.uploader.destroy(`courses/${thumbnailPublicId}`);
//     }

//     res.status(200).json({ message: "Course deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting course:", error);
//     res.status(500).json({ message: "Failed to delete course" });
//   }
// });

// Delete All Courses
// router.delete("/courses", protect, authorizeRoles("admin"), async (req, res) => {
//   try {
//     // Fetch all courses to delete associated Cloudinary files
//     const courses = await Course.find({});
//     for (const course of courses) {
//       if (course.image) {
//         const publicId = course.image.split("/").pop().split(".")[0];
//         await cloudinary.uploader.destroy(`courses/${publicId}`);
//       }
//       for (const video of course.videos) {
//         const videoPublicId = video.url.split("/").pop().split(".")[0];
//         const thumbnailPublicId = video.thumbnail ? video.thumbnail.split("/").pop().split(".")[0] : null;
//         await cloudinary.uploader.destroy(`courses/${videoPublicId}`, { resource_type: "video" });
//         if (thumbnailPublicId) await cloudinary.uploader.destroy(`courses/${thumbnailPublicId}`);
//       }
//     }

//     await Course.deleteMany({});
//     res.status(200).json({ message: "All courses deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting all courses:", error);
//     res.status(500).json({ message: "Failed to delete all courses" });
//   }
// });