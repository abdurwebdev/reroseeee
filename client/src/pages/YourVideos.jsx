import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FeedSidebar from '../components/FeedSidebar';
import { FaVideo, FaSearch, FaTrash, FaEdit } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const YourVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'video', 'short'
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // Fetch user's videos
    const fetchUserVideos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/free-videos/feed`, {
          withCredentials: true,
        });
        
        // Filter only user's videos
        const userVideos = res.data.filter(video => video.uploader === storedUser.name);
        setVideos(userVideos);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user videos:', err);
        setError('Failed to load your videos');
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
    
    fetchUserVideos();
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
  
  // Filter videos based on search term and type
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || video.type === filterType;
    return matchesSearch && matchesType;
  });
  
  // Delete video
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/free-videos/${videoId}`, {
        withCredentials: true
      });
      
      // Update local state
      setVideos(prev => prev.filter(video => video._id !== videoId));
      showSuccessToast('Video deleted successfully');
    } catch (err) {
      console.error('Error deleting video:', err);
      showErrorToast('Failed to delete video');
    }
  };
  
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
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <FaVideo className="text-red-500 text-2xl mr-2" />
              <h1 className="text-2xl font-bold">Your Videos</h1>
            </div>
            
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search your videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-full text-black bg-white outline-none border border-gray-300 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-full ${filterType === 'all' ? 'bg-red-600' : 'bg-gray-800'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterType('video')}
                  className={`px-4 py-2 rounded-full ${filterType === 'video' ? 'bg-red-600' : 'bg-gray-800'}`}
                >
                  Videos
                </button>
                <button 
                  onClick={() => setFilterType('short')}
                  className={`px-4 py-2 rounded-full ${filterType === 'short' ? 'bg-red-600' : 'bg-gray-800'}`}
                >
                  Shorts
                </button>
              </div>
            </div>
            
            {/* Upload buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <Link to="/upload-video" className="px-4 py-2 bg-[#111111] text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
                Upload Video
              </Link>
              <Link to="/upload-short" className="px-4 py-2 bg-[#111111] text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
                Upload Short
              </Link>
              <Link to="/live-course" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Go Live
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading your videos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm || filterType !== 'all' ? (
                  <p>No videos found matching your filters</p>
                ) : (
                  <>
                    <p className="text-xl mb-2">You haven't uploaded any videos yet</p>
                    <p className="text-gray-400 mb-4">Your uploaded videos will appear here</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-[#111111] rounded-lg overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="p-3 text-left">Video</th>
                      <th className="p-3 text-left">Visibility</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Views</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.map(video => (
                      <tr key={video._id} className="border-t border-gray-700">
                        <td className="p-3">
                          <div className="flex items-center">
                            <Link to={`/watch/${video._id}`} className="flex items-center">
                              <div className="w-24 h-16 flex-shrink-0 mr-3">
                                <img 
                                  src={video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `http://localhost:5000${video.thumbnailUrl}`} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium">{video.title}</h3>
                                <p className="text-xs text-gray-400">{video.description?.substring(0, 50)}...</p>
                              </div>
                            </Link>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-800 text-green-100 rounded-full text-xs">
                            Public
                          </span>
                        </td>
                        <td className="p-3 text-gray-300">
                          {formatDate(video.createdAt)}
                        </td>
                        <td className="p-3 text-gray-300">
                          {video.views}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Link 
                              to={`/edit-video/${video._id}`} 
                              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              title="Edit video"
                            >
                              <FaEdit />
                            </Link>
                            <button 
                              onClick={() => handleDeleteVideo(video._id)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              title="Delete video"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourVideos;
