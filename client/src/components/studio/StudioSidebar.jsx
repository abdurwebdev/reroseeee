import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaVideo,
  FaChartBar,
  FaDollarSign,
  FaCheckCircle,
  FaCog,
  FaUpload,
  FaBook,
  FaUserGraduate
} from 'react-icons/fa';

const StudioSidebar = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Define sidebar links
  const sidebarLinks = [
    {
      to: '/studio',
      icon: <FaHome className="text-xl" />,
      text: 'Dashboard',
      end: true
    },
    {
      to: '/studio/content',
      icon: <FaVideo className="text-xl" />,
      text: 'Content'
    },
    {
      to: '/studio/courses',
      icon: <FaBook className="text-xl" />,
      text: 'Courses'
    },
    {
      to: '/studio/analytics',
      icon: <FaChartBar className="text-xl" />,
      text: 'Analytics'
    },
    {
      to: '/studio/monetization',
      icon: <FaDollarSign className="text-xl" />,
      text: 'Monetization'
    },
    {
      to: '/studio/verification',
      icon: <FaCheckCircle className="text-xl" />,
      text: 'Verification'
    },
    {
      to: '/studio/settings',
      icon: <FaCog className="text-xl" />,
      text: 'Settings'
    }
  ];

  // Upload links
  const uploadLinks = [
    {
      to: '/upload-video',
      text: 'Upload Video'
    },
    {
      to: '/upload-short',
      text: 'Upload Short'
    },
    {
      to: '/live-course',
      text: 'Go Live'
    },
    {
      to: '/studio/courses',
      text: 'Create Course'
    }
  ];

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4 flex flex-col">
      {/* Channel info */}
      <div className="mb-6 flex items-center">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
          </div>
        )}
        <div>
          <h3 className="font-bold text-white">{user?.name}</h3>
          <p className="text-gray-400 text-sm">Creator Studio</p>
        </div>
      </div>

      {/* Create button */}
      <div className="mb-6">
        <div className="relative" ref={dropdownRef}>
          <button
            className="bg-red-600 hover:bg-red-700 text-white w-full py-2 px-4 rounded-lg flex items-center justify-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUpload className="mr-2" />
            <span>Create</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
              {uploadLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className="block px-4 py-2 text-white hover:bg-gray-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  {link.text}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {sidebarLinks.map((link, index) => (
            <li key={index}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{link.icon}</span>
                <span>{link.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Channel link */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <NavLink
          to={`/channel/${user?._id}`}
          className="flex items-center px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <span className="mr-3">
            <FaVideo className="text-xl" />
          </span>
          <span>View Channel</span>
        </NavLink>
      </div>
    </div>
  );
};

export default StudioSidebar;
