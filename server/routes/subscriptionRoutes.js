const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

// Subscribe to a channel
router.post('/subscribe', protect, subscriptionController.subscribeToChannel);

// Unsubscribe from a channel
router.post('/unsubscribe', protect, subscriptionController.unsubscribeFromChannel);

// Get all channels a user is subscribed to
router.get('/my-subscriptions', protect, subscriptionController.getSubscriptions);

// Check if a user is subscribed to a channel
router.get('/check/:channelId', protect, subscriptionController.checkSubscription);

// Get subscriber count for a channel
router.get('/count/:channelId', subscriptionController.getSubscriberCount);

module.exports = router;
