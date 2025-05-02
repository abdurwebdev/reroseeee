import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FeedSidebar from '../components/FeedSidebar';
import { FaTrash, FaHistory, FaSearch } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const History = () => {
  const [history, setHistory] = useState([]);
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
    
    // Fetch user's watch history
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/library/history`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setHistory(res.data.history);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load watch history');
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
    
    fetchHistory();
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
  
  // Format watch time
  const formatWatchTime = (seconds) => {
    if (!seconds) return '0s';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };
  
  // Remove a video from history
  const removeFromHistory = async (videoId) => {
    try {
      await axios.delete(`${API_URL}/api/library/history/${videoId}`, {
        withCredentials: true
      });
      
      // Update local state
      setHistory(prev => prev.filter(item => item.video._id !== videoId));
      showSuccessToast('Video removed from history');
    } catch (err) {
      console.error('Error removing from history:', err);
      showErrorToast('Failed to remove video from history');
    }
  };
  
  // Clear entire history
  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire watch history?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/library/history`, {
        withCredentials: true
      });
      
      setHistory([]);
      showSuccessToast('Watch history cleared');
    } catch (err) {
      console.error('Error clearing history:', err);
      showErrorToast('Failed to clear watch history');
    }
  };
  
  // Filter history based on search term
  const filteredHistory = history.filter(item => 
    item.video && item.video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group history by date
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = new Date(item.watchedAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});
  
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
                <FaHistory className="mr-2" /> Watch History
              </h1>
              
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                >
                  <FaTrash className="mr-1" /> Clear All History
                </button>
              )}
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search watch history..."
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
                <p className="mt-4">Loading your watch history...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm ? (
                  <p>No videos found matching "{searchTerm}"</p>
                ) : (
                  <>
                    <p className="text-xl mb-2">Your watch history is empty</p>
                    <p className="text-gray-400">Videos you watch will appear here</p>
                    <Link to="/feed" className="mt-4 inline-block px-4 py-2 bg-blue-600 rounded-lg">
                      Browse videos
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div>
                {Object.entries(groupedHistory).map(([date, items]) => (
                  <div key={date} className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-300">
                      {formatDate(items[0].watchedAt)}
                    </h2>
                    
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item._id} className="flex bg-[#111111] rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
                          <Link to={`/watch/${item.video._id}`} className="flex flex-1">
                            <div className="w-48 h-28 flex-shrink-0">
                              <img 
                                src={item.video.thumbnailUrl} 
                                alt={item.video.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="p-3 flex-1">
                              <h3 className="font-medium text-lg">{item.video.title}</h3>
                              <div className="flex items-center text-sm text-gray-400 mt-1">
                                <span>{item.video.uploader}</span>
                                <span className="mx-1">•</span>
                                <span>{item.video.views} views</span>
                                {item.watchTimeSeconds > 0 && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span>Watched for {formatWatchTime(item.watchTimeSeconds)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                          
                          <button 
                            onClick={() => removeFromHistory(item.video._id)}
                            className="px-4 flex items-center justify-center text-gray-400 hover:text-red-500"
                            title="Remove from history"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
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

export default History;
