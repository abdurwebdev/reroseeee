const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const channelController = require('../controllers/channelController');

// Get channel info
router.get('/:channelId', channelController.getChannelInfo);

// Get channel videos
router.get('/:channelId/videos', channelController.getChannelVideos);

// Get channel livestreams
router.get('/:channelId/livestreams', channelController.getChannelLivestreams);

// Update channel info (protected)
router.put('/update', 
  protect, 
  channelController.upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
  ]), 
  channelController.updateChannelInfo
);

// Community posts
router.get('/:channelId/community', channelController.getCommunityPosts);
router.post('/community/post', 
  protect, 
  channelController.upload.single('image'), 
  channelController.createCommunityPost
);
router.post('/community/post/:postId/like', protect, channelController.toggleLikePost);
router.post('/community/post/:postId/comment', protect, channelController.addComment);

module.exports = router;
