const express = require('express');
const router = express.Router();
const FreeVideo = require('../models/FreeVideo');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/cloudinaryUpload'); 

// Get all videos (public feed)
router.get('/feed', async (req, res) => {
  try {
    const videos = await FreeVideo.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search videos
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });
    
    const videos = await FreeVideo.find({
      title: { $regex: q, $options: 'i' }
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/upload-video', upload, async (req, res) => {
  try {
    const { title, uploader } = req.body;
    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    const video = new FreeVideo({
      title,
      videoUrl: videoFile.path,
      thumbnailUrl: thumbnailFile.path,
      uploader,
      type: 'video',
    });

    await video.save();
    res.status(201).json(video);
  } catch (err) {
    console.error('Upload Video Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload a free short
router.post('/upload-short', upload, async (req, res) => {
  try {
    const { title, uploader } = req.body;
    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    const video = new FreeVideo({
      title,
      videoUrl: videoFile.path,
      thumbnailUrl: thumbnailFile.path,
      uploader,
      type: 'short',
    });

    await video.save();
    res.status(201).json(video);
  } catch (err) {
    console.error('Upload Short Error:', err);
    res.status(500).json({ error: err.message });
  }
});
// Like a video
router.post('/:id/like', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const userId = req.user._id;
    
    // Check if already liked
    const hasLiked = video.likes.some(id => id.equals(userId));
    const hasDisliked = video.dislikes.some(id => id.equals(userId));

    if (hasLiked) {
      // Unlike if already liked
      video.likes = video.likes.filter(id => !id.equals(userId));
    } else {
      // Add like and remove dislike if exists
      video.likes.push(userId);
      
      if (hasDisliked) {
        video.dislikes = video.dislikes.filter(id => !id.equals(userId));
      }
    }

    await video.save();
    res.json({
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      hasLiked: video.likes.some(id => id.equals(userId)),
      hasDisliked: video.dislikes.some(id => id.equals(userId))
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dislike a video
router.post('/:id/dislike', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const userId = req.user._id;
    
    // Check if already disliked
    const hasLiked = video.likes.some(id => id.equals(userId));
    const hasDisliked = video.dislikes.some(id => id.equals(userId));

    if (hasDisliked) {
      // Un-dislike if already disliked
      video.dislikes = video.dislikes.filter(id => !id.equals(userId));
    } else {
      // Add dislike and remove like if exists
      video.dislikes.push(userId);
      
      if (hasLiked) {
        video.likes = video.likes.filter(id => !id.equals(userId));
      }
    }

    await video.save();
    res.json({
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      hasLiked: video.likes.some(id => id.equals(userId)),
      hasDisliked: video.dislikes.some(id => id.equals(userId))
    });
  } catch (error) {
    console.error('Dislike error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to a video's uploader
router.post('/:id/subscribe', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const userId = req.user._id;
    
    // Check if already subscribed
    const isSubscribed = video.subscriptions && video.subscriptions.some(id => id.equals(userId));
    
    if (isSubscribed) {
      // Unsubscribe
      video.subscriptions = video.subscriptions.filter(id => !id.equals(userId));
    } else {
      // Subscribe
      if (!video.subscriptions) {
        video.subscriptions = [];
      }
      video.subscriptions.push(userId);
    }

    await video.save();
    res.json({
      isSubscribed: !isSubscribed,
      subscriberCount: video.subscriptions.length
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status
router.get('/:id/subscription-status', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const userId = req.user._id;
    const isSubscribed = video.subscriptions && video.subscriptions.some(id => id.equals(userId));

    res.json({
      isSubscribed,
      subscriberCount: video.subscriptions ? video.subscriptions.length : 0
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscriber count (public route)
router.get('/:id/subscriber-count', async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    res.json({
      subscriberCount: video.subscriptions ? video.subscriptions.length : 0
    });
  } catch (error) {
    console.error('Subscriber count error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if commenter is the video creator
    const isCreator = video.uploaderId && video.uploaderId.equals(req.user._id);

    const newComment = {
      userId: req.user._id,
      username: req.user.username || req.user.name || 'User',
      text: text.trim(),
      createdAt: new Date(),
      reactions: [],
      replies: [],
      isCreator,
      pinned: false
    };

    video.comments.push(newComment);
    await video.save();

    // Find the newly added comment
    const addedComment = video.comments[video.comments.length - 1];
    
    res.json(addedComment);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a reply to a comment
router.post('/:id/comment/:commentId/reply', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    // Find the comment
    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if replier is the video creator
    const isCreator = video.uploaderId && video.uploaderId.equals(req.user._id);

    const newReply = {
      userId: req.user._id,
      username: req.user.username || req.user.name || 'User',
      text: text.trim(),
      createdAt: new Date(),
      reactions: [],
      isCreator
    };

    comment.replies.push(newReply);
    await video.save();

    // Find the newly added reply
    const addedReply = comment.replies[comment.replies.length - 1];
    
    res.json(addedReply);
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pin/unpin a comment
router.post('/:id/comment/:commentId/pin', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Check if user is the video uploader
    if (!video.uploaderId || !video.uploaderId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only video creator can pin comments' });
    }

    // Find the comment
    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // If we're pinning a comment, unpin all other comments
    if (!comment.pinned) {
      video.comments.forEach(c => {
        if (c._id.toString() !== req.params.commentId) {
          c.pinned = false;
        }
      });
    }

    // Toggle pin status
    comment.pinned = !comment.pinned;
    await video.save();

    res.json({
      pinned: comment.pinned
    });
  } catch (error) {
    console.error('Pin comment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// React to a comment (like/dislike)
router.post('/:id/comment/:commentId/react', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { type } = req.body;
    if (!type || !['like', 'dislike'].includes(type)) {
      return res.status(400).json({ error: 'Valid reaction type (like/dislike) is required' });
    }

    // Find the comment
    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user._id;
    
    // Check if user already reacted
    const existingReactionIndex = comment.reactions.findIndex(
      r => r.userId.equals(userId)
    );

    if (existingReactionIndex > -1) {
      const existingReaction = comment.reactions[existingReactionIndex];
      
      if (existingReaction.type === type) {
        // Remove reaction if same type (toggle off)
        comment.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change reaction type
        existingReaction.type = type;
      }
    } else {
      // Add new reaction
      comment.reactions.push({
        userId,
        type
      });
    }

    await video.save();

    // Count reactions
    const likes = comment.reactions.filter(r => r.type === 'like').length;
    const dislikes = comment.reactions.filter(r => r.type === 'dislike').length;
    
    // Get current user's reaction
    const userReaction = comment.reactions.find(r => r.userId.equals(userId));

    res.json({
      likes,
      dislikes,
      userReaction: userReaction ? userReaction.type : null
    });
  } catch (error) {
    console.error('Comment reaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// React to a reply
router.post('/:id/comment/:commentId/reply/:replyId/react', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { type } = req.body;
    if (!type || !['like', 'dislike'].includes(type)) {
      return res.status(400).json({ error: 'Valid reaction type (like/dislike) is required' });
    }

    // Find the comment
    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Find the reply
    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const userId = req.user._id;
    
    // Check if user already reacted
    const existingReactionIndex = reply.reactions.findIndex(
      r => r.userId.equals(userId)
    );

    if (existingReactionIndex > -1) {
      const existingReaction = reply.reactions[existingReactionIndex];
      
      if (existingReaction.type === type) {
        // Remove reaction if same type (toggle off)
        reply.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change reaction type
        existingReaction.type = type;
      }
    } else {
      // Add new reaction
      reply.reactions.push({
        userId,
        type
      });
    }

    await video.save();

    // Count reactions
    const likes = reply.reactions.filter(r => r.type === 'like').length;
    const dislikes = reply.reactions.filter(r => r.type === 'dislike').length;
    
    // Get current user's reaction
    const userReaction = reply.reactions.find(r => r.userId.equals(userId));

    res.json({
      likes,
      dislikes,
      userReaction: userReaction ? userReaction.type : null
    });
  } catch (error) {
    console.error('Reply reaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Find the comment
    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check authorization (comment author, video creator, or admin)
    const isCommentAuthor = comment.userId && comment.userId.equals(req.user._id);
    const isVideoCreator = video.uploaderId && video.uploaderId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isVideoCreator && !isAdmin) {
      return res.status(403).json({ 
        error: 'You are not authorized to delete this comment'
      });
    }

    // Remove the comment
    video.comments.pull(req.params.commentId);
    await video.save();

    res.json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a reply
router.delete('/:id/comment/:commentId/reply/:replyId', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Find the comment
    const comment = video.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Find the reply
    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Check authorization (reply author, comment author, video creator, or admin)
    const isReplyAuthor = reply.userId && reply.userId.equals(req.user._id);
    const isCommentAuthor = comment.userId && comment.userId.equals(req.user._id);
    const isVideoCreator = video.uploaderId && video.uploaderId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isReplyAuthor && !isCommentAuthor && !isVideoCreator && !isAdmin) {
      return res.status(403).json({ 
        error: 'You are not authorized to delete this reply'
      });
    }

    // Remove the reply
    comment.replies.pull(req.params.replyId);
    await video.save();

    res.json({
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single video (and increment views)
router.get('/:id', async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Increment views
    video.views += 1;
    await video.save();
    
    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all videos (admin only)
router.delete("/all", protect, async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const result = await FreeVideo.deleteMany({});
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No videos found to delete" });
    }
    
    res.status(200).json({ 
      message: "All videos deleted", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Delete all error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a video
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await FreeVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Check authorization (video creator or admin)
    const isVideoCreator = video.uploaderId && video.uploaderId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isVideoCreator && !isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this video" });
    }

    await FreeVideo.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports = router;