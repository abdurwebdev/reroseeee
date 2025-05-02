import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FeedSidebar from '../components/FeedSidebar';
import { FaFire, FaSearch } from 'react-icons/fa';

const API_URL = "http://localhost:5000";

const Trending = () => {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'video', 'short'

  // Check if user is logged in
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    
    // Fetch trending videos
    const fetchTrendingVideos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/free-videos/trending`);
        setTrendingVideos(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trending videos:', err);
        setError('Failed to load trending videos');
        setLoading(false);
      }
    };
    
    // Fetch user subscriptions if logged in
    const fetchSubscriptions = async () => {
      if (!storedUser) return;
      
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
    
    fetchTrendingVideos();
    fetchSubscriptions();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
  };
  
  // Filter videos based on search term and type
  const filteredVideos = trendingVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || video.type === filterType;
    return matchesSearch && matchesType;
  });
  
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
              <FaFire className="text-red-500 text-2xl mr-2" />
              <h1 className="text-2xl font-bold">Trending</h1>
            </div>
            
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search trending videos..."
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
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading trending videos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm ? (
                  <p>No trending videos found matching "{searchTerm}"</p>
                ) : (
                  <p>No trending videos available</p>
                )}
              </div>
            ) : (
              <div>
                {/* Display videos in a list format with rank numbers */}
                <div className="space-y-4">
                  {filteredVideos.map((video, index) => (
                    <Link 
                      to={`/watch/${video._id}`} 
                      key={video._id}
                      className="flex bg-[#111111] rounded-lg overflow-hidden hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-12 flex-shrink-0 bg-gray-800 flex items-center justify-center text-2xl font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="w-64 h-36 flex-shrink-0">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-4 flex-1">
                        <h3 className="font-medium text-lg">{video.title}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <span>{video.uploader}</span>
                          <span className="mx-1">•</span>
                          <span>{video.views.toLocaleString()} views</span>
                          <span className="mx-1">•</span>
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                        <div className="mt-2 flex items-center">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${video.type === 'short' ? 'bg-red-600' : 'bg-blue-600'}`}>
                            {video.type === 'short' ? 'Short' : 'Video'}
                          </span>
                          <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                            Trending #{index + 1}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
