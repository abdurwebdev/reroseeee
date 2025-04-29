import React from 'react';
import { Link } from 'react-router-dom';

const LivestreamList = ({ livestreams, title, emptyMessage, linkTo = '/watch' }) => {
  if (!livestreams || livestreams.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">{title}</h2>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {livestreams.map((stream) => (
          <Link
            key={stream._id}
            to={`${linkTo}/${stream._id}`}
            className="block bg-[#111111] rounded-lg overflow-hidden hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="relative">
              {/* Placeholder image or thumbnail */}
              <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                {stream.status === 'active' ? (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    LIVE
                  </span>
                ) : (
                  stream.endedAt && (
                    <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                      ENDED
                    </span>
                  )
                )}
                <div className="text-4xl text-gray-600">
                  {stream.isScreenSharing ? (
                    <i className="fas fa-desktop"></i>
                  ) : (
                    <i className="fas fa-video"></i>
                  )}
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-md font-semibold text-gray-100 truncate">{stream.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {stream.user?.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stream.status === 'active'
                  ? `Started: ${formatDate(stream.startedAt)}`
                  : stream.endedAt
                  ? `Ended: ${formatDate(stream.endedAt)}`
                  : 'Not started yet'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LivestreamList;
