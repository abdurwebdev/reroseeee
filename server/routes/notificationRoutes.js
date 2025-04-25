// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Add a notification
router.post('/add', protect, async (req, res) => {
  try {
    const { userId, videoId, title, type } = req.body;
    
    if (!userId || !videoId || !title || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.notifications.push({
      videoId,
      title,
      type,
      read: false,
      createdAt: new Date()
    });
    
    await user.save();
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all notifications for a user
router.get('/user', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Sort notifications by createdAt in descending order
    const notifications = user.notifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Count unread notifications
    const unreadCount = notifications.filter(notif => !notif.read).length;
    
    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notifications as read
router.post('/mark-read', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body; // Optional array of specific notification IDs
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      user.notifications.forEach(notification => {
        if (notificationIds.includes(notification._id.toString())) {
          notification.read = true;
        }
      });
    } else {
      // Mark all as read
      user.notifications.forEach(notification => {
        notification.read = true;
      });
    }
    
    user.lastNotificationSeen = new Date();
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a notification
router.delete('/:notificationId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.notifications = user.notifications.filter(
      notification => notification._id.toString() !== notificationId
    );
    
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;