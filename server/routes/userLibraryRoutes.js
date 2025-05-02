const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserHistory = require('../models/UserHistory');
const WatchLater = require('../models/WatchLater');
const Playlist = require('../models/Playlist');
const FreeVideo = require('../models/FreeVideo');

// ===== HISTORY ROUTES =====

// Get user's watch history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await UserHistory.find({ user: req.user._id })
      .sort({ watchedAt: -1 })
      .populate('video')
      .limit(100);
    
    // Filter out any entries where the video has been deleted
    const validHistory = history.filter(item => item.video !== null);
    
    res.json({
      success: true,
      history: validHistory
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Add or update watch history entry
router.post('/history', protect, async (req, res) => {
  try {
    const { videoId, watchTimeSeconds } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ 
        success: false,
        error: 'Video ID is required' 
      });
    }
    
    // Check if video exists
    const videoExists = await FreeVideo.exists({ _id: videoId });
    if (!videoExists) {
      return res.status(404).json({ 
        success: false,
        error: 'Video not found' 
      });
    }
    
    // Update or create history entry
    const historyEntry = await UserHistory.findOneAndUpdate(
      { user: req.user._id, video: videoId },
      { 
        watchedAt: new Date(),
        watchTimeSeconds: watchTimeSeconds || 0
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      historyEntry
    });
  } catch (error) {
    console.error('Add to history error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Clear watch history
router.delete('/history', protect, async (req, res) => {
  try {
    await UserHistory.deleteMany({ user: req.user._id });
    
    res.json({
      success: true,
      message: 'Watch history cleared'
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Remove a single video from history
router.delete('/history/:videoId', protect, async (req, res) => {
  try {
    await UserHistory.findOneAndDelete({ 
      user: req.user._id,
      video: req.params.videoId
    });
    
    res.json({
      success: true,
      message: 'Video removed from history'
    });
  } catch (error) {
    console.error('Remove from history error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ===== WATCH LATER ROUTES =====

// Get watch later list
router.get('/watch-later', protect, async (req, res) => {
  try {
    const watchLater = await WatchLater.find({ user: req.user._id })
      .sort({ addedAt: -1 })
      .populate('video');
    
    // Filter out any entries where the video has been deleted
    const validWatchLater = watchLater.filter(item => item.video !== null);
    
    res.json({
      success: true,
      watchLater: validWatchLater
    });
  } catch (error) {
    console.error('Get watch later error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Add to watch later
router.post('/watch-later', protect, async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ 
        success: false,
        error: 'Video ID is required' 
      });
    }
    
    // Check if video exists
    const videoExists = await FreeVideo.exists({ _id: videoId });
    if (!videoExists) {
      return res.status(404).json({ 
        success: false,
        error: 'Video not found' 
      });
    }
    
    // Check if already in watch later
    const existing = await WatchLater.findOne({ 
      user: req.user._id,
      video: videoId
    });
    
    if (existing) {
      return res.json({
        success: true,
        message: 'Video already in watch later',
        watchLater: existing
      });
    }
    
    // Add to watch later
    const watchLater = new WatchLater({
      user: req.user._id,
      video: videoId
    });
    
    await watchLater.save();
    
    res.json({
      success: true,
      message: 'Added to watch later',
      watchLater
    });
  } catch (error) {
    console.error('Add to watch later error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Remove from watch later
router.delete('/watch-later/:videoId', protect, async (req, res) => {
  try {
    await WatchLater.findOneAndDelete({ 
      user: req.user._id,
      video: req.params.videoId
    });
    
    res.json({
      success: true,
      message: 'Removed from watch later'
    });
  } catch (error) {
    console.error('Remove from watch later error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Clear watch later
router.delete('/watch-later', protect, async (req, res) => {
  try {
    await WatchLater.deleteMany({ user: req.user._id });
    
    res.json({
      success: true,
      message: 'Watch later cleared'
    });
  } catch (error) {
    console.error('Clear watch later error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ===== LIKED VIDEOS ROUTES =====

// Get liked videos
router.get('/liked-videos', protect, async (req, res) => {
  try {
    // Find videos that the user has liked
    const likedVideos = await FreeVideo.find({
      likes: req.user._id
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      likedVideos
    });
  } catch (error) {
    console.error('Get liked videos error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ===== PLAYLIST ROUTES =====

// Get all playlists for the user
router.get('/playlists', protect, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      playlists
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get a specific playlist with videos
router.get('/playlists/:playlistId', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
      .populate('videos.video');
    
    if (!playlist) {
      return res.status(404).json({ 
        success: false,
        error: 'Playlist not found' 
      });
    }
    
    // If playlist is private, check if the user is the owner
    if (!playlist.isPublic) {
      // If not authenticated or not the owner
      if (!req.user || !playlist.user.equals(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'This playlist is private' 
        });
      }
    }
    
    // Filter out any videos that have been deleted
    playlist.videos = playlist.videos.filter(item => item.video !== null);
    
    res.json({
      success: true,
      playlist
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Create a new playlist
router.post('/playlists', protect, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        error: 'Playlist name is required' 
      });
    }
    
    const playlist = new Playlist({
      name,
      description: description || '',
      user: req.user._id,
      isPublic: isPublic || false
    });
    
    await playlist.save();
    
    res.status(201).json({
      success: true,
      playlist
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Update a playlist
router.put('/playlists/:playlistId', protect, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const playlist = await Playlist.findById(req.params.playlistId);
    
    if (!playlist) {
      return res.status(404).json({ 
        success: false,
        error: 'Playlist not found' 
      });
    }
    
    // Check if user is the owner
    if (!playlist.user.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to update this playlist' 
      });
    }
    
    // Update fields
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    
    playlist.updatedAt = new Date();
    
    await playlist.save();
    
    res.json({
      success: true,
      playlist
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Delete a playlist
router.delete('/playlists/:playlistId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    
    if (!playlist) {
      return res.status(404).json({ 
        success: false,
        error: 'Playlist not found' 
      });
    }
    
    // Check if user is the owner
    if (!playlist.user.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to delete this playlist' 
      });
    }
    
    await Playlist.findByIdAndDelete(req.params.playlistId);
    
    res.json({
      success: true,
      message: 'Playlist deleted'
    });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Add a video to a playlist
router.post('/playlists/:playlistId/videos', protect, async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ 
        success: false,
        error: 'Video ID is required' 
      });
    }
    
    const playlist = await Playlist.findById(req.params.playlistId);
    
    if (!playlist) {
      return res.status(404).json({ 
        success: false,
        error: 'Playlist not found' 
      });
    }
    
    // Check if user is the owner
    if (!playlist.user.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to update this playlist' 
      });
    }
    
    // Check if video exists
    const videoExists = await FreeVideo.exists({ _id: videoId });
    if (!videoExists) {
      return res.status(404).json({ 
        success: false,
        error: 'Video not found' 
      });
    }
    
    // Check if video is already in playlist
    const videoInPlaylist = playlist.videos.some(v => v.video.equals(videoId));
    
    if (videoInPlaylist) {
      return res.json({
        success: true,
        message: 'Video already in playlist',
        playlist
      });
    }
    
    // Add video to playlist
    playlist.videos.push({
      video: videoId,
      addedAt: new Date()
    });
    
    playlist.updatedAt = new Date();
    
    await playlist.save();
    
    res.json({
      success: true,
      message: 'Video added to playlist',
      playlist
    });
  } catch (error) {
    console.error('Add to playlist error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Remove a video from a playlist
router.delete('/playlists/:playlistId/videos/:videoId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    
    if (!playlist) {
      return res.status(404).json({ 
        success: false,
        error: 'Playlist not found' 
      });
    }
    
    // Check if user is the owner
    if (!playlist.user.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to update this playlist' 
      });
    }
    
    // Remove video from playlist
    playlist.videos = playlist.videos.filter(
      v => !v.video.equals(req.params.videoId)
    );
    
    playlist.updatedAt = new Date();
    
    await playlist.save();
    
    res.json({
      success: true,
      message: 'Video removed from playlist',
      playlist
    });
  } catch (error) {
    console.error('Remove from playlist error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
