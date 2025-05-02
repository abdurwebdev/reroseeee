import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaPlay,
  FaBookmark,
  FaHistory,
  FaList,
  FaVideo,
  FaClock,
  FaThumbsUp,
  FaDownload,
  FaCut,
  FaFire,
  FaYoutube,
  FaMusic,
  FaChild,
  FaCog,
  FaFlag,
  FaQuestionCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaNewspaper,
  FaCopyright,
  FaPhone,
  FaUser,
  FaAd,
  FaCode
} from 'react-icons/fa';

const FeedSidebar = ({ user, subscriptions = [] }) => {
  const location = useLocation();

  // Main navigation items
  const mainNavItems = [
    { path: '/feed', icon: <FaHome className="text-xl" />, label: 'Home' },
    { path: '/shorts', icon: <FaPlay className="text-xl" />, label: 'Shorts' },
    { path: '/subscriptions', icon: <FaBookmark className="text-xl" />, label: 'Subscriptions' },
  ];

  // User library items
  const libraryItems = [
    { path: '/history', icon: <FaHistory className="text-xl" />, label: 'History' },
    { path: '/playlists', icon: <FaList className="text-xl" />, label: 'Playlists' },
    { path: '/your-videos', icon: <FaVideo className="text-xl" />, label: 'Your videos' },
    { path: '/watch-later', icon: <FaClock className="text-xl" />, label: 'Watch later' },
    { path: '/liked-videos', icon: <FaThumbsUp className="text-xl" />, label: 'Liked videos' },
    { path: '/downloads', icon: <FaDownload className="text-xl" />, label: 'Downloads' },
    { path: '/your-clips', icon: <FaCut className="text-xl" />, label: 'Your clips' },
  ];

  // More from Rerose items
  const moreItems = [
    { path: '/premium', icon: <FaYoutube className="text-xl" />, label: 'Rerose Premium' },
    { path: '/studio', icon: <FaVideo className="text-xl" />, label: 'Rerose Studio' },
    { path: '/music', icon: <FaMusic className="text-xl" />, label: 'Rerose Music' },
    { path: '/kids', icon: <FaChild className="text-xl" />, label: 'Rerose Kids' },
  ];

  // Settings and help items
  const settingsItems = [
    { path: '/settings', icon: <FaCog className="text-xl" />, label: 'Settings' },
    { path: '/report-history', icon: <FaFlag className="text-xl" />, label: 'Report history' },
    { path: '/help', icon: <FaQuestionCircle className="text-xl" />, label: 'Help' },
    { path: '/feedback', icon: <FaExclamationCircle className="text-xl" />, label: 'Send feedback' },
  ];

  // Footer links
  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Press', path: '/press' },
    { label: 'Copyright', path: '/copyright' },
    { label: 'Contact us', path: '/contact' },
    { label: 'Creators', path: '/creators' },
    { label: 'Advertise', path: '/advertise' },
    { label: 'Developers', path: '/developers' },
    { label: 'Terms', path: '/terms' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Policy & Safety', path: '/policy' },
    { label: 'How Rerose works', path: '/how-rerose-works' },
    { label: 'Test new features', path: '/test-features' },
  ];

  // Helper function to render nav items
  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
      >
        <span className="mr-4">{item.icon}</span>
        <span className="text-sm">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="bg-black text-white h-full overflow-y-auto scrollbar-hide">
      {/* Main navigation */}
      <div className="py-2">
        {mainNavItems.map(renderNavItem)}
      </div>

      {/* Library section */}
      <div className="py-2 border-t border-gray-800">
        <h3 className="px-3 py-2 text-sm font-semibold text-gray-400">Library</h3>
        {libraryItems.map(renderNavItem)}
      </div>

      {/* Subscriptions section - only show if user is logged in */}
      {user && (
        <div className="py-2 border-t border-gray-800">
          <h3 className="px-3 py-2 text-sm font-semibold text-gray-400">Subscriptions</h3>
          {subscriptions.length > 0 ? (
            subscriptions.map(channel => (
              <Link
                key={channel._id}
                to={`/channel/${channel._id}`}
                className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                {channel.profileImageUrl ? (
                  <img
                    src={channel.profileImageUrl}
                    alt={channel.name}
                    className="w-6 h-6 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center mr-4">
                    <span className="text-xs text-white">{channel.name.charAt(0)}</span>
                  </div>
                )}
                <span className="text-sm">{channel.name}</span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">No subscriptions yet</p>
          )}
        </div>
      )}

      {/* Trending */}
      <div className="py-2 border-t border-gray-800">
        <Link
          to="/trending"
          className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <span className="mr-4"><FaFire className="text-xl" /></span>
          <span className="text-sm">Trending</span>
        </Link>
      </div>

      {/* More from Rerose */}
      <div className="py-2 border-t border-gray-800">
        <h3 className="px-3 py-2 text-sm font-semibold text-gray-400">More from Rerose</h3>
        {moreItems.map(renderNavItem)}
      </div>

      {/* Settings */}
      <div className="py-2 border-t border-gray-800">
        {settingsItems.map(renderNavItem)}
      </div>

      {/* Footer links */}
      <div className="py-4 px-3 border-t border-gray-800 text-xs text-gray-500">
        <div className="flex flex-wrap gap-2">
          {footerLinks.slice(0, 6).map((link, index) => (
            <Link key={index} to={link.path} className="hover:text-gray-300">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {footerLinks.slice(6).map((link, index) => (
            <Link key={index} to={link.path} className="hover:text-gray-300">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-4">
          © 2025 Rerose Academy
        </div>
      </div>
    </div>
  );
};

export default FeedSidebar;
