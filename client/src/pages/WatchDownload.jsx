import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaUserCircle } from 'react-icons/fa';
import getProfileImage from '../utils/getProfileImage';

const WatchDownload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    const found = downloads.find(d => d.id === id);
    if (!found) {
      navigate('/downloads');
      return;
    }
    setVideo(found);
  }, [id, navigate]);

  if (!video) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <div className="w-full max-w-4xl mt-8">
        <video src={video.videoUrl} controls autoPlay className="w-full rounded-lg bg-gray-900" />
        <h1 className="text-2xl font-bold mt-4 mb-2">{video.title}</h1>
        <div className="flex items-center mb-4">
          {getProfileImage(video, video.channel) ? (
            <img
              src={getProfileImage(video, video.channel)}
              alt={video.channel}
              className="w-12 h-12 rounded-full object-cover mr-3"
              onError={e => e.target.src = "/default-avatar.png"}
            />
          ) : (
            <FaUserCircle className="w-12 h-12 text-gray-600 mr-3" />
          )}
          <div>
            <div className="font-semibold">{video.channel || 'Unknown Channel'}</div>
            <div className="text-gray-400 text-sm">{video.date ? new Date(video.date).toLocaleDateString() : ''}</div>
          </div>
        </div>
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center text-gray-400">
            <span className="mr-1">Views:</span>
            <span>{video.views || 0}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <FaThumbsUp className="mr-1" />
            <span>{video.likes || 0}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <FaThumbsDown className="mr-1" />
            <span>{video.dislikes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchDownload;
