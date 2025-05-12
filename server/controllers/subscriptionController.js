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

    // Increment the channel owner's subscriber count
    channelOwner.subscriberCount = (channelOwner.subscriberCount || 0) + 1;
    await channelOwner.save();

    console.log(`Incremented subscriber count for ${channelOwner.name} to ${channelOwner.subscriberCount}`);

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to channel',
      subscriberCount: channelOwner.subscriberCount
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

    // Find the channel owner
    const channelOwner = await User.findById(channelId);
    if (!channelOwner) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
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

    // Decrement the channel owner's subscriber count (ensure it doesn't go below 0)
    channelOwner.subscriberCount = Math.max(0, (channelOwner.subscriberCount || 0) - 1);
    await channelOwner.save();

    console.log(`Decremented subscriber count for ${channelOwner.name} to ${channelOwner.subscriberCount}`);

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from channel',
      subscriberCount: channelOwner.subscriberCount
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

    // Find the channel owner to get subscriber count
    const channelOwner = await User.findById(channelId);
    if (!channelOwner) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    const isSubscribed = user.subscriptions.includes(channelId);

    res.status(200).json({
      success: true,
      isSubscribed,
      subscriberCount: channelOwner.subscriberCount || 0
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

    // Find the channel owner
    const channelOwner = await User.findById(channelId);
    if (!channelOwner) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Return the subscriber count from the user document
    res.status(200).json({
      success: true,
      subscriberCount: channelOwner.subscriberCount || 0
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
