import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FeedSidebar from '../components/FeedSidebar';
import { FaTrash, FaClock, FaSearch } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const WatchLater = () => {
  const [watchLater, setWatchLater] = useState([]);
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
    
    // Fetch user's watch later list
    const fetchWatchLater = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/library/watch-later`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setWatchLater(res.data.watchLater);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching watch later:', err);
        setError('Failed to load watch later list');
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
    
    fetchWatchLater();
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
  
  // Remove a video from watch later
  const removeFromWatchLater = async (videoId) => {
    try {
      await axios.delete(`${API_URL}/api/library/watch-later/${videoId}`, {
        withCredentials: true
      });
      
      // Update local state
      setWatchLater(prev => prev.filter(item => item.video._id !== videoId));
      showSuccessToast('Video removed from Watch Later');
    } catch (err) {
      console.error('Error removing from watch later:', err);
      showErrorToast('Failed to remove video from Watch Later');
    }
  };
  
  // Clear entire watch later list
  const clearWatchLater = async () => {
    if (!window.confirm('Are you sure you want to clear your entire Watch Later list?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/library/watch-later`, {
        withCredentials: true
      });
      
      setWatchLater([]);
      showSuccessToast('Watch Later list cleared');
    } catch (err) {
      console.error('Error clearing watch later:', err);
      showErrorToast('Failed to clear Watch Later list');
    }
  };
  
  // Filter watch later based on search term
  const filteredWatchLater = watchLater.filter(item => 
    item.video && item.video.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                <FaClock className="mr-2" /> Watch Later
              </h1>
              
              {watchLater.length > 0 && (
                <button 
                  onClick={clearWatchLater}
                  className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                >
                  <FaTrash className="mr-1" /> Clear Watch Later
                </button>
              )}
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search watch later..."
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
                <p className="mt-4">Loading your Watch Later list...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredWatchLater.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm ? (
                  <p>No videos found matching "{searchTerm}"</p>
                ) : (
                  <>
                    <p className="text-xl mb-2">Your Watch Later list is empty</p>
                    <p className="text-gray-400">Save videos to watch later by clicking the clock icon</p>
                    <Link to="/feed" className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded-lg">
                      Browse videos
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWatchLater.map(item => (
                  <div key={item._id} className="bg-[#111111] rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
                    <Link to={`/watch/${item.video._id}`} className="block">
                      <div className="relative">
                        <img 
                          src={item.video.thumbnailUrl} 
                          alt={item.video.title} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 text-xs rounded">
                          Added {formatDate(item.addedAt)}
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-lg line-clamp-2">{item.video.title}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <span>{item.video.uploader}</span>
                          <span className="mx-1">•</span>
                          <span>{item.video.views} views</span>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="px-3 pb-3 flex justify-end">
                      <button 
                        onClick={() => removeFromWatchLater(item.video._id)}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove from Watch Later"
                      >
                        <FaTrash />
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

export default WatchLater;
