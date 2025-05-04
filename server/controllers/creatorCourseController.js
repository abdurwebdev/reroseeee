const Course = require("../models/Course");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

// Create a new course
exports.createCourse = async (req, res) => {
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

    // Validate required fields
    if (!title || !description || !price || !instructor || !duration || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "Price must be a valid positive number." });
    }

    // Get the creator ID from the authenticated user
    const creatorId = req.user._id;

    // Process image and videos
    const image = req.files.image ? req.files.image[0].path : null; // Cloudinary URL
    const videoThumbnails = req.files.thumbnails || [];

    // Check if video titles match the number of videos
    if (req.files.videos && Array.isArray(videoTitles) && videoTitles.length !== req.files.videos.length) {
      return res.status(400).json({ message: "Number of video titles must match number of videos." });
    }

    // Create video objects
    const videos = req.files.videos
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

    // Create the course
    const newCourse = new Course({
      title,
      description,
      price,
      instructor,
      duration,
      category,
      image,
      videos,
      paymentOptions,
      creatorId,
      status: "draft" // Initial status is draft
    });

    await newCourse.save();
    res.status(201).json({ 
      success: true,
      message: "Course created successfully", 
      course: newCourse 
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create course",
      error: error.message
    });
  }
};

// Get all courses created by the logged-in creator
exports.getCreatorCourses = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const courses = await Course.find({ creatorId });
    
    res.status(200).json({ 
      success: true,
      courses 
    });
  } catch (error) {
    console.error("Error fetching creator courses:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch courses",
      error: error.message
    });
  }
};

// Get a specific course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user._id;

    // Validate course ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findOne({ _id: id, creatorId });
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found or you don't have permission to access it" 
      });
    }

    res.status(200).json({ 
      success: true,
      course 
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch course",
      error: error.message
    });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user._id;
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

    // Validate course ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findOne({ _id: id, creatorId });
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found or you don't have permission to update it" 
      });
    }

    // Check if course is in a state that can be updated
    if (course.status !== "draft" && course.status !== "rejected") {
      return res.status(400).json({ 
        success: false,
        message: "Only courses in 'draft' or 'rejected' status can be updated" 
      });
    }

    // Process image if provided
    if (req.files.image && req.files.image[0]) {
      // Delete old image from Cloudinary if it exists
      if (course.image) {
        const publicId = course.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`creator-courses/${publicId}`);
      }
      course.image = req.files.image[0].path;
    }

    // Process new videos if provided
    if (req.files.videos && req.files.videos.length > 0) {
      const videoThumbnails = req.files.thumbnails || [];

      // Check if video titles match the number of videos
      if (Array.isArray(videoTitles) && videoTitles.length !== req.files.videos.length) {
        return res.status(400).json({ 
          success: false,
          message: "Number of video titles must match number of videos" 
        });
      }

      // Create new video objects
      const newVideos = req.files.videos.map((file, index) => ({
        url: file.path,
        title: Array.isArray(videoTitles) ? videoTitles[index] : videoTitles || "",
        description: Array.isArray(videoDescriptions) ? videoDescriptions[index] : videoDescriptions || "",
        thumbnail: videoThumbnails[index] ? videoThumbnails[index].path : null,
        likes: [],
        dislikes: [],
        comments: [],
      }));

      // Add new videos to the course
      course.videos = [...course.videos, ...newVideos];
    }

    // Update course fields
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

    // Reset status to draft if it was rejected
    if (course.status === "rejected") {
      course.status = "draft";
      course.rejectionReason = null;
    }

    await course.save();
    res.status(200).json({ 
      success: true,
      message: "Course updated successfully", 
      course 
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update course",
      error: error.message
    });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user._id;

    // Validate course ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findOne({ _id: id, creatorId });
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found or you don't have permission to delete it" 
      });
    }

    // Delete course media from Cloudinary
    if (course.image) {
      const publicId = course.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`creator-courses/${publicId}`);
    }

    // Delete course videos and thumbnails
    for (const video of course.videos) {
      if (video.url) {
        const videoPublicId = video.url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`creator-courses/${videoPublicId}`, { resource_type: "video" });
      }
      if (video.thumbnail) {
        const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`creator-courses/${thumbnailPublicId}`);
      }
    }

    // Delete the course
    await Course.findByIdAndDelete(id);
    res.status(200).json({ 
      success: true,
      message: "Course deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete course",
      error: error.message
    });
  }
};

// Submit a course for review
exports.submitCourseForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user._id;

    // Validate course ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findOne({ _id: id, creatorId });
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found or you don't have permission to submit it" 
      });
    }

    // Check if course is in draft or rejected status
    if (course.status !== "draft" && course.status !== "rejected") {
      return res.status(400).json({ 
        success: false,
        message: "Only courses in 'draft' or 'rejected' status can be submitted for review" 
      });
    }

    // Check if course has all required fields
    if (!course.title || !course.description || !course.price || !course.instructor || !course.duration || !course.category || !course.image) {
      return res.status(400).json({ 
        success: false,
        message: "Course must have all required fields before submission" 
      });
    }

    // Check if course has at least one video
    if (!course.videos || course.videos.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Course must have at least one video before submission" 
      });
    }

    // Update course status to pending_review
    course.status = "pending_review";
    await course.save();

    res.status(200).json({ 
      success: true,
      message: "Course submitted for review successfully", 
      course 
    });
  } catch (error) {
    console.error("Error submitting course for review:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to submit course for review",
      error: error.message
    });
  }
};

// Add a comment to a course video
exports.addComment = async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    // Validate course ID
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // Check if video exists
    if (!course.videos[videoIndex]) {
      return res.status(404).json({ 
        success: false,
        message: "Video not found" 
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user is the course creator
    const isCreator = course.creatorId && course.creatorId.toString() === userId.toString();

    // Create the comment
    const newComment = {
      userId,
      username: user.name,
      profileImage: user.profileImageUrl || null,
      comment,
      createdAt: new Date(),
      isCreator,
      replies: []
    };

    // Add the comment to the video
    course.videos[videoIndex].comments.push(newComment);
    await course.save();

    res.status(201).json({ 
      success: true,
      message: "Comment added successfully", 
      comment: newComment 
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add comment",
      error: error.message
    });
  }
};

// Add a reply to a comment
exports.addReply = async (req, res) => {
  try {
    const { courseId, videoIndex, commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    // Validate course ID
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // Check if video exists
    if (!course.videos[videoIndex]) {
      return res.status(404).json({ 
        success: false,
        message: "Video not found" 
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user is the course creator
    const isCreator = course.creatorId && course.creatorId.toString() === userId.toString();

    // Find the comment
    const commentIndex = course.videos[videoIndex].comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found" 
      });
    }

    // Create the reply
    const newReply = {
      userId,
      username: user.name,
      profileImage: user.profileImageUrl || null,
      comment,
      createdAt: new Date(),
      isCreator
    };

    // Add the reply to the comment
    course.videos[videoIndex].comments[commentIndex].replies.push(newReply);
    await course.save();

    res.status(201).json({ 
      success: true,
      message: "Reply added successfully", 
      reply: newReply 
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to add reply",
      error: error.message
    });
  }
};

// Like a video
exports.likeVideo = async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;
    const userId = req.user._id;

    // Validate course ID
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // Check if video exists
    if (!course.videos[videoIndex]) {
      return res.status(404).json({ 
        success: false,
        message: "Video not found" 
      });
    }

    const video = course.videos[videoIndex];

    // Check if user already liked the video
    const alreadyLiked = video.likes.some(id => id.toString() === userId.toString());
    
    // Check if user already disliked the video
    const alreadyDisliked = video.dislikes.some(id => id.toString() === userId.toString());

    if (alreadyLiked) {
      // Remove like if already liked (toggle)
      video.likes = video.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add like
      video.likes.push(userId);
      
      // Remove dislike if exists
      if (alreadyDisliked) {
        video.dislikes = video.dislikes.filter(id => id.toString() !== userId.toString());
      }
    }

    await course.save();

    res.status(200).json({ 
      success: true,
      message: alreadyLiked ? "Like removed" : "Video liked successfully",
      likes: video.likes.length,
      dislikes: video.dislikes.length
    });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to like video",
      error: error.message
    });
  }
};

// Dislike a video
exports.dislikeVideo = async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;
    const userId = req.user._id;

    // Validate course ID
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // Check if video exists
    if (!course.videos[videoIndex]) {
      return res.status(404).json({ 
        success: false,
        message: "Video not found" 
      });
    }

    const video = course.videos[videoIndex];

    // Check if user already disliked the video
    const alreadyDisliked = video.dislikes.some(id => id.toString() === userId.toString());
    
    // Check if user already liked the video
    const alreadyLiked = video.likes.some(id => id.toString() === userId.toString());

    if (alreadyDisliked) {
      // Remove dislike if already disliked (toggle)
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add dislike
      video.dislikes.push(userId);
      
      // Remove like if exists
      if (alreadyLiked) {
        video.likes = video.likes.filter(id => id.toString() !== userId.toString());
      }
    }

    await course.save();

    res.status(200).json({ 
      success: true,
      message: alreadyDisliked ? "Dislike removed" : "Video disliked successfully",
      likes: video.likes.length,
      dislikes: video.dislikes.length
    });
  } catch (error) {
    console.error("Error disliking video:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to dislike video",
      error: error.message
    });
  }
};
