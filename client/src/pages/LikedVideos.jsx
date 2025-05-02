import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FeedSidebar from '../components/FeedSidebar';
import { FaThumbsUp, FaSearch } from 'react-icons/fa';
import { showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const LikedVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // Fetch user's liked videos
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/library/liked-videos`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setLikedVideos(res.data.likedVideos);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching liked videos:', err);
        setError('Failed to load liked videos');
        setLoading(false);
      }
    };
    
    // Fetch user subscriptions
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/subscriptions/my-subscriptions`, {
          withCredentials: true,
        });
        
        if (res.data.success) {
          setSubscriptions(res.data.subscriptions || []);
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      }
    };
    
    fetchLikedVideos();
    fetchSubscriptions();
  }, [navigate]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Unlike a video
  const unlikeVideo = async (videoId) => {
    try {
      await axios.post(`${API_URL}/api/free-videos/${videoId}/like`, {}, {
        withCredentials: true
      });
      
      // Update local state
      setLikedVideos(prev => prev.filter(video => video._id !== videoId));
    } catch (err) {
      console.error('Error unliking video:', err);
      showErrorToast('Failed to unlike video');
    }
  };
  
  // Filter liked videos based on search term
  const filteredLikedVideos = likedVideos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />
      
      <div className="flex flex-col md:flex-row">
        {/* Sidebar - hidden on mobile, shown on larger screens */}
        <div className="hidden md:block md:w-64 lg:w-72 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          <FeedSidebar user={user} subscriptions={subscriptions} />
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center">
                <FaThumbsUp className="mr-2" /> Liked Videos
              </h1>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search liked videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-full text-black bg-white outline-none border border-gray-300 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading your liked videos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredLikedVideos.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm ? (
                  <p>No videos found matching "{searchTerm}"</p>
                ) : (
                  <>
                    <p className="text-xl mb-2">No liked videos yet</p>
                    <p className="text-gray-400">Videos you like will appear here</p>
                    <Link to="/feed" className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded-lg">
                      Browse videos
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLikedVideos.map(video => (
                  <div key={video._id} className="bg-[#111111] rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
                    <Link to={`/watch/${video._id}`} className="block">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-48 object-cover"
                      />
                      
                      <div className="p-3">
                        <h3 className="font-medium text-lg line-clamp-2">{video.title}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <span>{video.uploader}</span>
                          <span className="mx-1">•</span>
                          <span>{video.views} views</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(video.createdAt)}
                        </div>
                      </div>
                    </Link>
                    
                    <div className="px-3 pb-3 flex justify-end">
                      <button 
                        onClick={() => unlikeVideo(video._id)}
                        className="flex items-center text-blue-500 hover:text-blue-400"
                        title="Unlike video"
                      >
                        <FaThumbsUp className="mr-1" />
                        <span className="text-sm">Liked</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedVideos;
