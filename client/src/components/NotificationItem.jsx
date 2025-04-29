import React from 'react';
import axiosInstance from '../utils/axiosConfig';

// Memoized NotificationItem component for better performance
const NotificationItem = React.memo(({
  notification,
  onNotificationClick,
  API_URL
}) => {
  // Format the date to show how long ago the notification was created
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

      if (diffDays > 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffMinutes > 0) {
        return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
      } else {
        return 'just now';
      }
    } catch (error) {
      return 'recently';
    }
  };

  // Handle notification click
  const handleClick = (e) => {
    e.preventDefault();

    // Mark notification as read if it's unread
    if (!notification.read) {
      axiosInstance.post('/api/notifications/mark-read', {
        notificationIds: [notification._id]
      })
        .then(() => {
          // Update localStorage to remember that this notification has been seen
          localStorage.setItem('notificationsInitialized', 'true');
        })
        .catch(err => {
          console.error('Error marking notification as read:', err);
        });
    }

    // Call the parent's click handler
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Navigate to the video page
    const videoUrl = `${window.location.origin}/watch/${notification.videoId}`;
    window.location.href = videoUrl;
  };

  // Determine the thumbnail URL
  const thumbnailUrl = notification.thumbnailUrl ?
    (notification.thumbnailUrl.startsWith('http') ?
      notification.thumbnailUrl :
      `${API_URL}${notification.thumbnailUrl}`) :
    '/default-thumbnail.jpg';

  return (
    <a
      href={`/watch/${notification.videoId}`}
      className={`flex p-3 hover:bg-gray-800 border-b border-gray-700 ${!notification.read ? 'bg-gray-800/30' : ''}`}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-12 flex-shrink-0">
        <img
          src={thumbnailUrl}
          alt={notification.title || 'Video thumbnail'}
          className="w-20 h-12 object-cover rounded"
          onError={(e) => e.target.src = "/default-thumbnail.jpg"}
        />
        {notification.type === 'upload' && !notification.read && (
          <div className="absolute bottom-0 right-0 bg-red-600 text-white text-xs px-1 rounded">
            NEW
          </div>
        )}
      </div>

      {/* Content */}
      <div className="ml-3 flex-grow overflow-hidden">
        {/* Title with unread indicator */}
        <div className="flex items-start">
          <p className="text-sm font-medium line-clamp-2 flex-grow">{notification.title}</p>
          {!notification.read && (
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 ml-2 flex-shrink-0"></span>
          )}
        </div>

        {/* Channel and time */}
        <div className="flex items-center mt-1">
          <p className="text-xs text-gray-400 truncate">
            {notification.uploader || 'Unknown channel'}
          </p>
          <span className="mx-1 text-gray-500">•</span>
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {formatDate(notification.createdAt)}
          </p>
        </div>

        {/* Notification type message */}
        {notification.type === 'upload' && (
          <div className="mt-1 flex items-center">
            <span className="text-xs text-red-500 font-medium">
              {notification.uploader} uploaded a new video
            </span>
          </div>
        )}
      </div>
    </a>
  );
});

// Display name for debugging
NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
