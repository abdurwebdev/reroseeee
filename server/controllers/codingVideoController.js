const CodingVideo = require('../models/CodingVideo');
const User = require('../models/User');
const { sendUploadNotifications } = require('../utils/notificationHelper');
const cloudinary = require('cloudinary').v2;

// Video types
const VIDEO_TYPES = {
  REGULAR: 'video',
  SHORT: 'short'
};

/**
 * Upload a new coding video
 * @route POST /api/coding-videos/upload
 * @access Private (Professional Coders only)
 */
const uploadCodingVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      programmingLanguages,
      frameworks,
      difficultyLevel,
      codeSnippets,
      resources,
      tags,
      learningOutcomes,
      prerequisites
    } = req.body;

    // Get files from multer
    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    // Get user info
    const uploaderId = req.user._id;
    const uploader = req.user.name;

    // Validate required fields
    if (!title || !description || !programmingLanguages || !difficultyLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, programming languages, and difficulty level.'
      });
    }

    // Safely parse JSON strings with error handling
    let parsedLanguages = [];
    let parsedFrameworks = [];
    let parsedTags = [];
    let parsedLearningOutcomes = [];
    let parsedPrerequisites = [];
    let parsedCodeSnippets = [];
    let parsedResources = [];

    try {
      // Parse programming languages
      if (programmingLanguages) {
        parsedLanguages = Array.isArray(programmingLanguages)
          ? programmingLanguages
          : JSON.parse(programmingLanguages);
      }

      // Parse frameworks (optional)
      if (frameworks) {
        if (Array.isArray(frameworks)) {
          parsedFrameworks = frameworks;
        } else if (typeof frameworks === 'string') {
          // If it's a comma-separated string, split it
          if (frameworks.includes(',')) {
            parsedFrameworks = frameworks.split(',').map(item => item.trim());
          } else {
            // Try to parse as JSON, if it fails, treat as a single item
            try {
              parsedFrameworks = JSON.parse(frameworks);
            } catch (e) {
              parsedFrameworks = [frameworks];
            }
          }
        }
      }

      // Parse tags (optional)
      if (tags) {
        if (Array.isArray(tags)) {
          parsedTags = tags;
        } else if (typeof tags === 'string') {
          // If it's a comma-separated string, split it
          if (tags.includes(',')) {
            parsedTags = tags.split(',').map(item => item.trim());
          } else {
            // Try to parse as JSON, if it fails, treat as a single item
            try {
              parsedTags = JSON.parse(tags);
            } catch (e) {
              parsedTags = [tags];
            }
          }
        }
      }

      // Parse learning outcomes (optional)
      if (learningOutcomes) {
        if (Array.isArray(learningOutcomes)) {
          parsedLearningOutcomes = learningOutcomes;
        } else if (typeof learningOutcomes === 'string') {
          // If it contains newlines, split by newlines
          if (learningOutcomes.includes('\n')) {
            parsedLearningOutcomes = learningOutcomes.split('\n').map(item => item.trim()).filter(Boolean);
          } else {
            // Try to parse as JSON, if it fails, treat as a single item
            try {
              parsedLearningOutcomes = JSON.parse(learningOutcomes);
            } catch (e) {
              parsedLearningOutcomes = [learningOutcomes];
            }
          }
        }
      }

      // Parse prerequisites (optional)
      if (prerequisites) {
        if (Array.isArray(prerequisites)) {
          parsedPrerequisites = prerequisites;
        } else if (typeof prerequisites === 'string') {
          // If it contains newlines, split by newlines
          if (prerequisites.includes('\n')) {
            parsedPrerequisites = prerequisites.split('\n').map(item => item.trim()).filter(Boolean);
          } else {
            // Try to parse as JSON, if it fails, treat as a single item
            try {
              parsedPrerequisites = JSON.parse(prerequisites);
            } catch (e) {
              parsedPrerequisites = [prerequisites];
            }
          }
        }
      }

      // Parse code snippets
      if (req.body.parsedCodeSnippets) {
        parsedCodeSnippets = req.body.parsedCodeSnippets;
      } else if (codeSnippets) {
        parsedCodeSnippets = Array.isArray(codeSnippets)
          ? codeSnippets
          : JSON.parse(codeSnippets);
      }

      // Parse resources (optional)
      if (resources) {
        parsedResources = Array.isArray(resources)
          ? resources
          : JSON.parse(resources);
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
      return res.status(400).json({
        success: false,
        message: 'Error parsing form data. Please check your input and try again.',
        error: error.message
      });
    }

    // Create new coding video
    const codingVideo = new CodingVideo({
      title,
      description,
      videoUrl: videoFile.path,
      thumbnailUrl: thumbnailFile.path,
      uploader,
      uploaderId,
      type: VIDEO_TYPES.REGULAR, // Set as regular video
      programmingLanguages: parsedLanguages,
      frameworks: parsedFrameworks,
      difficultyLevel,
      codeSnippets: parsedCodeSnippets,
      resources: parsedResources,
      tags: parsedTags,
      learningOutcomes: parsedLearningOutcomes,
      prerequisites: parsedPrerequisites,
      duration: req.body.duration || 0
    });

    // Save to database
    await codingVideo.save();

    // Send notifications to subscribers
    const notificationCount = await sendUploadNotifications(uploaderId, codingVideo);
    console.log(`Sent ${notificationCount} notifications for new coding video upload`);

    res.status(201).json({
      success: true,
      message: 'Coding video uploaded successfully!',
      data: codingVideo
    });
  } catch (err) {
    console.error('Upload Coding Video Error:', err);

    // Provide more specific error messages based on the error type
    if (err.message.includes('codeSnippets')) {
      return res.status(400).json({
        success: false,
        message: 'There was an issue with your code snippets. Please ensure each snippet has a language and code content.',
        error: err.message
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error. Please check all required fields.',
        error: err.message
      });
    }

    if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in one of the fields. Please check your submission.',
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading coding video',
      error: err.message
    });
  }
};

/**
 * Get all coding videos (public feed)
 * @route GET /api/coding-videos/feed
 * @access Public
 */
const getCodingVideosFeed = async (req, res) => {
  try {
    const { language, difficulty, sort = 'newest' } = req.query;

    // Build query
    const query = {};

    // Filter by programming language if provided
    if (language) {
      query.programmingLanguages = language;
    }

    // Filter by difficulty level if provided
    if (difficulty) {
      query.difficultyLevel = difficulty;
    }

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await CodingVideo.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('uploaderId', 'name profileImageUrl');

    // Get total count for pagination
    const total = await CodingVideo.countDocuments(query);

    res.json({
      success: true,
      data: videos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Coding Videos Feed Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding videos',
      error: error.message
    });
  }
};

/**
 * Get a single coding video by ID
 * @route GET /api/coding-videos/:id
 * @access Public
 */
const getCodingVideoById = async (req, res) => {
  try {
    const video = await CodingVideo.findById(req.params.id)
      .populate('uploaderId', 'name profileImageUrl subscriberCount');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Coding video not found'
      });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Get Coding Video Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding video',
      error: error.message
    });
  }
};

/**
 * Get trending coding videos based on views and likes
 * @route GET /api/coding-videos/trending
 * @access Public
 */
const getTrendingCodingVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get videos with most views and likes in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const videos = await CodingVideo.find({
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ views: -1, 'likes.length': -1 })
      .limit(limit)
      .populate('uploaderId', 'name profileImageUrl');

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get Trending Coding Videos Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending coding videos',
      error: error.message
    });
  }
};

/**
 * Get recommended coding videos based on user's viewing history
 * @route GET /api/coding-videos/recommended
 * @access Public
 */
const getRecommendedCodingVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    let userId = null;

    // If user is logged in, get recommendations based on their history
    if (req.user) {
      userId = req.user._id;

      // TODO: Implement actual recommendation algorithm based on user history
      // For now, just return videos matching user's preferred languages if available
      if (req.user.programmingLanguages && req.user.programmingLanguages.length > 0) {
        const videos = await CodingVideo.find({
          programmingLanguages: { $in: req.user.programmingLanguages }
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('uploaderId', 'name profileImageUrl');

        return res.json({
          success: true,
          data: videos
        });
      }
    }

    // If user is not logged in or has no preferences, return popular videos
    const videos = await CodingVideo.find()
      .sort({ views: -1 })
      .limit(limit)
      .populate('uploaderId', 'name profileImageUrl');

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get Recommended Coding Videos Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended coding videos',
      error: error.message
    });
  }
};

/**
 * Get latest coding videos
 * @route GET /api/coding-videos/latest
 * @access Public
 */
const getLatestCodingVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const videos = await CodingVideo.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('uploaderId', 'name profileImageUrl');

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get Latest Coding Videos Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest coding videos',
      error: error.message
    });
  }
};

/**
 * Like a coding video
 * @route POST /api/coding-videos/:id/like
 * @access Private
 */
const likeCodingVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    const video = await CodingVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user already liked the video
    const alreadyLiked = video.likes.includes(userId);

    // Check if user already disliked the video
    const alreadyDisliked = video.dislikes.includes(userId);

    // If already liked, remove the like (toggle)
    if (alreadyLiked) {
      video.likes = video.likes.filter(id => !id.equals(userId));
      await video.save();

      return res.json({
        success: true,
        message: 'Like removed',
        data: {
          likes: video.likes.length,
          dislikes: video.dislikes.length,
          userAction: 'none'
        }
      });
    }

    // If already disliked, remove the dislike and add like
    if (alreadyDisliked) {
      video.dislikes = video.dislikes.filter(id => !id.equals(userId));
    }

    // Add like
    video.likes.push(userId);
    await video.save();

    res.json({
      success: true,
      message: 'Video liked successfully',
      data: {
        likes: video.likes.length,
        dislikes: video.dislikes.length,
        userAction: 'liked'
      }
    });
  } catch (error) {
    console.error('Like Coding Video Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking video',
      error: error.message
    });
  }
};

/**
 * Dislike a coding video
 * @route POST /api/coding-videos/:id/dislike
 * @access Private
 */
const dislikeCodingVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    const video = await CodingVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user already disliked the video
    const alreadyDisliked = video.dislikes.includes(userId);

    // Check if user already liked the video
    const alreadyLiked = video.likes.includes(userId);

    // If already disliked, remove the dislike (toggle)
    if (alreadyDisliked) {
      video.dislikes = video.dislikes.filter(id => !id.equals(userId));
      await video.save();

      return res.json({
        success: true,
        message: 'Dislike removed',
        data: {
          likes: video.likes.length,
          dislikes: video.dislikes.length,
          userAction: 'none'
        }
      });
    }

    // If already liked, remove the like and add dislike
    if (alreadyLiked) {
      video.likes = video.likes.filter(id => !id.equals(userId));
    }

    // Add dislike
    video.dislikes.push(userId);
    await video.save();

    res.json({
      success: true,
      message: 'Video disliked successfully',
      data: {
        likes: video.likes.length,
        dislikes: video.dislikes.length,
        userAction: 'disliked'
      }
    });
  } catch (error) {
    console.error('Dislike Coding Video Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disliking video',
      error: error.message
    });
  }
};

/**
 * Add a comment to a coding video
 * @route POST /api/coding-videos/:id/comments
 * @access Private
 */
const addComment = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { text, timestamp } = req.body;
    const userId = req.user._id;
    const username = req.user.name;
    const userProfileImage = req.user.profileImageUrl;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const video = await CodingVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if commenter is the video creator
    const isCreator = video.uploaderId.equals(userId);

    const newComment = {
      userId,
      username,
      text,
      createdAt: new Date(),
      reactions: [],
      replies: [],
      isCreator,
      userProfileImage,
      timestamp: timestamp || null
    };

    video.comments.push(newComment);
    await video.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

/**
 * Add a reply to a comment
 * @route POST /api/coding-videos/:id/comments/:commentId/replies
 * @access Private
 */
const addReply = async (req, res) => {
  try {
    const videoId = req.params.id;
    const commentId = req.params.commentId;
    const { text } = req.body;
    const userId = req.user._id;
    const username = req.user.name;
    const userProfileImage = req.user.profileImageUrl;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required'
      });
    }

    const video = await CodingVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Find the comment
    const comment = video.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if replier is the video creator
    const isCreator = video.uploaderId.equals(userId);

    const newReply = {
      userId,
      username,
      text,
      createdAt: new Date(),
      reactions: [],
      isCreator,
      userProfileImage
    };

    comment.replies.push(newReply);
    await video.save();

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: newReply
    });
  } catch (error) {
    console.error('Add Reply Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message
    });
  }
};

/**
 * Upload a new coding short
 * @route POST /api/coding-videos/upload-short
 * @access Private (Professional Coders only)
 */
const uploadCodingShort = async (req, res) => {
  try {
    const {
      title,
      description,
      programmingLanguages,
      frameworks,
      difficultyLevel,
      codeSnippets,
      resources,
      tags,
      learningOutcomes,
      prerequisites
    } = req.body;

    // Get files from multer
    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    // Get user info
    const uploaderId = req.user._id;
    const uploader = req.user.name;

    // Validate required fields
    if (!title || !programmingLanguages) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title and programming languages.'
      });
    }

    // Safely parse JSON strings with error handling
    let parsedLanguages = [];
    let parsedFrameworks = [];
    let parsedTags = [];
    let parsedCodeSnippets = [];
    let parsedResources = [];

    try {
      // Parse programming languages
      if (programmingLanguages) {
        parsedLanguages = Array.isArray(programmingLanguages)
          ? programmingLanguages
          : JSON.parse(programmingLanguages);
      }

      // Parse frameworks (optional)
      if (frameworks) {
        if (Array.isArray(frameworks)) {
          parsedFrameworks = frameworks;
        } else if (typeof frameworks === 'string') {
          // If it's a comma-separated string, split it
          if (frameworks.includes(',')) {
            parsedFrameworks = frameworks.split(',').map(item => item.trim());
          } else {
            // Try to parse as JSON, if it fails, treat as a single item
            try {
              parsedFrameworks = JSON.parse(frameworks);
            } catch (e) {
              parsedFrameworks = [frameworks];
            }
          }
        }
      }

      // Parse tags (optional)
      if (tags) {
        if (Array.isArray(tags)) {
          parsedTags = tags;
        } else if (typeof tags === 'string') {
          // If it's a comma-separated string, split it
          if (tags.includes(',')) {
            parsedTags = tags.split(',').map(item => item.trim());
          } else {
            // Try to parse as JSON, if it fails, treat as a single item
            try {
              parsedTags = JSON.parse(tags);
            } catch (e) {
              parsedTags = [tags];
            }
          }
        }
      }

      // Parse code snippets
      if (req.body.parsedCodeSnippets) {
        parsedCodeSnippets = req.body.parsedCodeSnippets;
      } else if (codeSnippets) {
        parsedCodeSnippets = Array.isArray(codeSnippets)
          ? codeSnippets
          : JSON.parse(codeSnippets);
      }

      // Parse resources (optional)
      if (resources) {
        parsedResources = Array.isArray(resources)
          ? resources
          : JSON.parse(resources);
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
      return res.status(400).json({
        success: false,
        message: 'Error parsing form data. Please check your input and try again.',
        error: error.message
      });
    }

    // Create new coding short
    const codingShort = new CodingVideo({
      title,
      description: description || title, // Use title as description if not provided
      videoUrl: videoFile.path,
      thumbnailUrl: thumbnailFile.path,
      uploader,
      uploaderId,
      type: VIDEO_TYPES.SHORT, // Set as short video
      programmingLanguages: parsedLanguages,
      frameworks: parsedFrameworks,
      difficultyLevel: difficultyLevel || 'beginner', // Default to beginner if not specified
      codeSnippets: parsedCodeSnippets,
      resources: parsedResources,
      tags: parsedTags,
      duration: req.body.duration || 0
    });

    // Save to database
    await codingShort.save();

    // Send notifications to subscribers
    const notificationCount = await sendUploadNotifications(uploaderId, codingShort);
    console.log(`Sent ${notificationCount} notifications for new coding short upload`);

    res.status(201).json({
      success: true,
      message: 'Coding short uploaded successfully!',
      data: codingShort
    });
  } catch (err) {
    console.error('Upload Coding Short Error:', err);

    // Provide specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error. Please check all required fields.',
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading coding short',
      error: err.message
    });
  }
};

module.exports = {
  uploadCodingVideo,
  uploadCodingShort,
  getCodingVideosFeed,
  getCodingVideoById,
  getTrendingCodingVideos,
  getRecommendedCodingVideos,
  getLatestCodingVideos,
  likeCodingVideo,
  dislikeCodingVideo,
  addComment,
  addReply
};
