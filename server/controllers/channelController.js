const User = require('../models/User');
const FreeVideo = require('../models/FreeVideo');
const Livestream = require('../models/Livestream');
const CommunityPost = require('../models/CommunityPost');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get channel information
exports.getChannelInfo = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Find the channel owner
    const channel = await User.findById(channelId).select('-password -notifications -lastNotificationSeen');
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Get subscriber count
    const subscriberCount = await User.countDocuments({ subscriptions: channelId });

    // Return channel info with subscriber count
    res.status(200).json({
      success: true,
      channel: {
        ...channel.toObject(),
        subscriberCount
      }
    });
  } catch (error) {
    console.error('Error getting channel info:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get channel videos
exports.getChannelVideos = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { type } = req.query; // 'video', 'short', or undefined for all

    // Build query
    const query = { uploaderId: channelId };
    if (type) {
      query.type = type;
    }

    // Find videos
    const videos = await FreeVideo.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Error getting channel videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get channel livestreams
exports.getChannelLivestreams = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { status } = req.query; // 'active', 'ended', or undefined for all

    // Build query
    const query = { user: channelId };
    if (status) {
      query.status = status;
    }

    // Find livestreams
    const livestreams = await Livestream.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      livestreams
    });
  } catch (error) {
    console.error('Error getting channel livestreams:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/channel');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer upload instance
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Update channel info
exports.updateChannelInfo = async (req, res) => {
  try {
    console.log('Update channel info called');
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);

    const userId = req.user._id;
    const { channelDescription, location, website, twitter, instagram, facebook } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (channelDescription !== undefined) user.channelDescription = channelDescription;
    if (location !== undefined) user.location = location;

    // Update social links
    if (!user.socialLinks) user.socialLinks = {};
    if (website !== undefined) user.socialLinks.website = website;
    if (twitter !== undefined) user.socialLinks.twitter = twitter;
    if (instagram !== undefined) user.socialLinks.instagram = instagram;
    if (facebook !== undefined) user.socialLinks.facebook = facebook;

    // Handle profile image upload
    console.log('Checking for profile image:', req.files);
    if (req.files && req.files.profileImage) {
      const profileImage = req.files.profileImage[0];
      console.log('Profile image found:', profileImage);
      user.profileImageUrl = `/uploads/channel/${profileImage.filename}`;
    } else {
      console.log('No profile image found in request');
    }

    // Handle banner image upload
    console.log('Checking for banner image:', req.files);
    if (req.files && req.files.bannerImage) {
      const bannerImage = req.files.bannerImage[0];
      console.log('Banner image found:', bannerImage);
      user.bannerImageUrl = `/uploads/channel/${bannerImage.filename}`;
    } else {
      console.log('No banner image found in request');
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Channel updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        bannerImageUrl: user.bannerImageUrl,
        channelDescription: user.channelDescription,
        location: user.location,
        socialLinks: user.socialLinks
      }
    });
  } catch (error) {
    console.error('Error updating channel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get community posts
exports.getCommunityPosts = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Find posts
    const posts = await CommunityPost.find({ userId: channelId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name profileImageUrl');

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Error getting community posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create community post
exports.createCommunityPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Post text is required'
      });
    }

    // Create post object
    const postData = {
      userId,
      text
    };

    // Handle image upload
    if (req.file) {
      postData.imageUrl = `/uploads/channel/${req.file.filename}`;
    }

    // Create post
    const post = await CommunityPost.create(postData);

    // Populate user info
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('userId', 'name profileImageUrl');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Like/unlike community post
exports.toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Find post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add comment to community post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // Find post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add comment
    post.comments.push({
      userId,
      username: user.name,
      text
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
