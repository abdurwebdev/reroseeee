import React, { useCallback } from 'react';
import NotificationItem from './NotificationItem';
import axiosInstance from '../utils/axiosConfig';

const NotificationDropdown = ({
  notifications,
  setNotifications,
  setUnreadCount,
  setShowNotifications,
  API_URL
}) => {
  // Mark all notifications as read
  const markAllAsRead = useCallback((e) => {
    e.stopPropagation();

    // Update UI immediately
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Update server and reset notification state
    axiosInstance.post('/api/notifications/mark-read')
      .then(() => {
        // Update localStorage to remember that notifications have been seen
        localStorage.setItem('notificationsInitialized', 'true');
      })
      .catch(err => {
        console.error('Error marking all notifications as read:', err);
      });
  }, [notifications, setNotifications, setUnreadCount]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // Close the dropdown
    setShowNotifications(false);

    // Update unread count if this notification was unread
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Update local state to mark this notification as read
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
    }
  }, [setShowNotifications, setUnreadCount, setNotifications]);

  return (
    <div className="absolute right-0 mt-2 w-96 bg-[#212121] rounded-lg shadow-lg overflow-hidden z-50 max-w-[95vw]">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 font-medium flex justify-between items-center">
        <span>Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-[70vh] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onNotificationClick={handleNotificationClick}
              API_URL={API_URL}
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-400">No new notifications</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(NotificationDropdown);
