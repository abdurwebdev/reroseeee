import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';
import axiosInstance from '../utils/axiosConfig';

const NotificationButton = ({ user, API_URL }) => {
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check localStorage for notification initialization state
  const [notificationsInitialized, setNotificationsInitialized] = useState(() => {
    // Try to get the initialization state from localStorage
    const savedState = localStorage.getItem('notificationsInitialized');
    return savedState === 'true';
  });

  // Ref for click outside detection
  const notificationRef = useRef(null);

  // Toggle notifications dropdown
  const toggleNotifications = useCallback(() => {
    const newState = !showNotifications;
    setShowNotifications(newState);

    // If opening the dropdown and there are unread notifications,
    // mark them as read in the database but keep the UI state for better UX
    if (newState && unreadCount > 0) {
      // Only update the database, don't update the UI yet
      axiosInstance.post('/api/notifications/mark-read')
        .catch(err => console.error('Error marking notifications as read:', err));
    }
  }, [showNotifications, unreadCount]);

  // Handle clicks outside the notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // Fetch notifications from the API
        const res = await axiosInstance.get('/api/notifications/user');

        if (res.data && res.data.notifications && res.data.notifications.length > 0) {
          // Process notifications to ensure they have all required fields
          const processedNotifications = res.data.notifications.map(notification => {
            // Ensure thumbnailUrl is properly formatted
            let thumbnailUrl = notification.thumbnailUrl || '';

            // If thumbnailUrl is not empty and doesn't start with http, make sure it's properly formatted
            if (thumbnailUrl && !thumbnailUrl.startsWith('http') && !thumbnailUrl.startsWith('/')) {
              thumbnailUrl = '/' + thumbnailUrl;
            }

            return {
              ...notification,
              thumbnailUrl,
              uploader: notification.uploader || 'Unknown Channel',
              uploaderId: notification.uploaderId || null
            };
          });

          setNotifications(processedNotifications);
          setUnreadCount(res.data.unreadCount);

          // No toast notification for new notifications
        } else {
          // Fallback: Use recent videos as "new video" notifications
          const videoRes = await axiosInstance.get('/api/free-videos/feed');

          // Get recent videos (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          // Filter videos from channels the user is subscribed to
          const subscriptionsRes = await axiosInstance.get('/api/subscriptions/my-subscriptions');
          const subscribedChannelIds = subscriptionsRes.data.success ?
            subscriptionsRes.data.subscriptions.map(sub => sub._id) : [];

          const recentVideos = videoRes.data
            .filter(video => new Date(video.createdAt) > sevenDaysAgo)
            // Only include videos from subscribed channels if we have subscription data
            .filter(video => subscribedChannelIds.length === 0 || subscribedChannelIds.includes(video.uploaderId))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

          const processedVideos = recentVideos.map(video => {
            // Process thumbnail URL
            let thumbnailUrl = video.thumbnailUrl || '';

            // If thumbnailUrl is not empty and doesn't start with http, make sure it's properly formatted
            if (thumbnailUrl && !thumbnailUrl.startsWith('http') && !thumbnailUrl.startsWith('/')) {
              thumbnailUrl = '/' + thumbnailUrl;
            }

            return {
              _id: video._id,
              videoId: video._id,
              title: video.title,
              thumbnailUrl,
              uploader: video.uploader || 'Unknown Channel',
              uploaderId: video.uploaderId || null,
              createdAt: video.createdAt,
              type: 'upload',
              read: false
            };
          });

          setNotifications(processedVideos);

          // Use 24 hours for "unread" status
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);

          const newUnreadCount = recentVideos.filter(
            video => new Date(video.createdAt) > oneDayAgo
          ).length;

          setUnreadCount(newUnreadCount);

          // No toast notification for new videos
        }

        // Mark as initialized after first fetch and save to localStorage
        if (!notificationsInitialized) {
          setNotificationsInitialized(true);
          localStorage.setItem('notificationsInitialized', 'true');
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    // Poll for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, API_URL, notificationsInitialized]);

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleNotifications}
        className="p-2 relative"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <NotificationDropdown
          notifications={notifications}
          setNotifications={setNotifications}
          setUnreadCount={setUnreadCount}
          setShowNotifications={setShowNotifications}
          API_URL={API_URL}
        />
      )}
    </div>
  );
};

export default React.memo(NotificationButton);
