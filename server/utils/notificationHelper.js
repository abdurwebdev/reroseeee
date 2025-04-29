const User = require('../models/User');

/**
 * Send notifications to subscribers when a new video is uploaded
 * @param {string} uploaderId - ID of the user who uploaded the video
 * @param {Object} video - The video object
 * @returns {Promise<number>} - Number of notifications sent
 */
const sendUploadNotifications = async (uploaderId, video) => {
  try {
    // Find all users who are subscribed to this uploader
    const subscribers = await User.find({ subscriptions: uploaderId });

    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found for this uploader');
      return 0;
    }

    // Create notifications for all subscribers
    const notificationPromises = subscribers.map(subscriber => {
      // Add notification to each subscriber
      subscriber.notifications.push({
        videoId: video._id,
        title: video.title,
        type: 'upload',
        read: false,
        createdAt: new Date(),
        thumbnailUrl: video.thumbnailUrl,
        uploader: video.uploader,
        uploaderId: video.uploaderId
      });

      return subscriber.save();
    });

    // Wait for all notifications to be saved
    if (notificationPromises.length > 0) {
      await Promise.all(notificationPromises);
      console.log(`Sent notifications to ${notificationPromises.length} subscribers`);
      return notificationPromises.length;
    }

    return 0;
  } catch (error) {
    console.error('Error sending notifications:', error);
    return 0;
  }
};

module.exports = {
  sendUploadNotifications
};
