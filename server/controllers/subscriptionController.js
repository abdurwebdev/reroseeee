const User = require('../models/User');
const FreeVideo = require('../models/FreeVideo');

// Subscribe to a channel
exports.subscribeToChannel = async (req, res) => {
  try {
    const { channelId } = req.body;
    const subscriberId = req.user._id;

    // Prevent subscribing to yourself
    if (channelId === subscriberId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot subscribe to your own channel'
      });
    }

    // Find the channel owner
    const channelOwner = await User.findById(channelId);
    if (!channelOwner) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Find the subscriber
    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    // Check if already subscribed
    if (subscriber.subscriptions.includes(channelId)) {
      return res.status(400).json({
        success: false,
        message: 'Already subscribed to this channel'
      });
    }

    // Add channel to subscriber's subscriptions
    subscriber.subscriptions.push(channelId);
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to channel'
    });
  } catch (error) {
    console.error('Error subscribing to channel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Unsubscribe from a channel
exports.unsubscribeFromChannel = async (req, res) => {
  try {
    const { channelId } = req.body;
    const subscriberId = req.user._id;

    // Find the subscriber
    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    // Check if subscribed
    if (!subscriber.subscriptions.includes(channelId)) {
      return res.status(400).json({
        success: false,
        message: 'Not subscribed to this channel'
      });
    }

    // Remove channel from subscriber's subscriptions
    subscriber.subscriptions = subscriber.subscriptions.filter(
      sub => sub.toString() !== channelId
    );
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from channel'
    });
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all channels a user is subscribed to
exports.getSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user with populated subscriptions
    const user = await User.findById(userId).populate('subscriptions', 'name profileImageUrl');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      subscriptions: user.subscriptions
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check if a user is subscribed to a channel
exports.checkSubscription = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isSubscribed = user.subscriptions.includes(channelId);

    res.status(200).json({
      success: true,
      isSubscribed
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get subscriber count for a channel
exports.getSubscriberCount = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Count users who have this channel in their subscriptions
    const subscriberCount = await User.countDocuments({
      subscriptions: channelId
    });

    res.status(200).json({
      success: true,
      subscriberCount
    });
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
