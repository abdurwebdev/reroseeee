import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to format view count
const formatViews = (views) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  } else {
    return `${views} views`;
  }
};

const ChannelVideos = ({ title, videos, type, emptyMessage, showMoreLink, showAll }) => {
  if (!videos || videos.length === 0) {
    return (
      <div className="py-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  // Determine grid columns based on content type
  const gridClass = type === 'short' 
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' 
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  // Determine link path based on content type
  const getLinkPath = (video) => {
    switch (type) {
      case 'livestream':
        return `/watch-livestream/${video._id}`;
      case 'ended-livestream':
        return `/watch-livestream/${video._id}`;
      case 'short':
        return `/watch/${video._id}`;
      default:
        return `/watch/${video._id}`;
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {showMoreLink && (
          <button 
            onClick={showMoreLink}
            className="text-blue-500 hover:text-blue-400"
          >
            View all
          </button>
        )}
      </div>

      <div className={`grid ${gridClass} gap-4`}>
        {videos.map((video) => (
          <Link 
            key={video._id} 
            to={getLinkPath(video)}
            className="block rounded-lg overflow-hidden bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img 
                src={video.thumbnailUrl || `${API_URL}${video.thumbnail}`} 
                alt={video.title || video.name} 
                className={`w-full ${type === 'short' ? 'aspect-[9/16] object-cover' : 'aspect-video object-cover'}`}
              />
              
              {/* Live indicator */}
              {type === 'livestream' && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  LIVE
                </div>
              )}
              
              {/* Play button for ended livestreams */}
              {type === 'ended-livestream' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <FaPlay className="text-white" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Video info */}
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-2">
                {video.title || video.name}
              </h3>
              
              {type !== 'short' && (
                <div className="text-xs text-gray-400 mt-1">
                  {video.views !== undefined && (
                    <span>{formatViews(video.views)} • </span>
                  )}
                  <span>{formatDate(video.createdAt)}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChannelVideos;
