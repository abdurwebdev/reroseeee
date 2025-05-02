import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FeedSidebar from '../components/FeedSidebar';
import { FaBookmark, FaSearch } from 'react-icons/fa';

const API_URL = "http://localhost:5000";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionVideos, setSubscriptionVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // Fetch user's subscriptions
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/subscriptions/my-subscriptions`, {
          withCredentials: true,
        });
        
        if (res.data.success) {
          setSubscriptions(res.data.subscriptions || []);
          
          // Fetch videos from subscribed channels
          if (res.data.subscriptions && res.data.subscriptions.length > 0) {
            await fetchSubscriptionVideos(res.data.subscriptions);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Failed to load subscriptions');
        setLoading(false);
      }
    };
    
    // Fetch videos from subscribed channels
    const fetchSubscriptionVideos = async (subs) => {
      try {
        // Get all videos
        const videosRes = await axios.get(`${API_URL}/api/free-videos/feed`, {
          withCredentials: true,
        });
        
        // Filter videos from subscribed channels
        const channelNames = subs.map(sub => sub.name);
        const filteredVideos = videosRes.data.filter(video => 
          channelNames.includes(video.uploader)
        );
        
        // Sort by newest first
        filteredVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setSubscriptionVideos(filteredVideos);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subscription videos:', err);
        setError('Failed to load videos from subscribed channels');
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [navigate]);
  
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
  
  // Filter videos based on search term
  const filteredVideos = subscriptionVideos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.uploader.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <FaBookmark className="text-red-500 text-2xl mr-2" />
              <h1 className="text-2xl font-bold">Subscriptions</h1>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subscription videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-full text-black bg-white outline-none border border-gray-300 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            
            {/* Subscribed channels */}
            {subscriptions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Subscribed Channels</h2>
                <div className="flex flex-wrap gap-4">
                  {subscriptions.map(channel => (
                    <Link 
                      key={channel._id} 
                      to={`/channel/${channel._id}`}
                      className="flex flex-col items-center"
                    >
                      {channel.profileImageUrl ? (
                        <img 
                          src={channel.profileImageUrl} 
                          alt={channel.name} 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                          <span className="text-xl text-white">{channel.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="mt-2 text-sm text-center">{channel.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading subscription videos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xl mb-2">You haven't subscribed to any channels yet</p>
                <p className="text-gray-400 mb-4">Subscribe to channels to see their latest videos here</p>
                <Link to="/feed" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Explore Videos
                </Link>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm ? (
                  <p>No videos found matching "{searchTerm}"</p>
                ) : (
                  <p>No videos from your subscribed channels</p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Latest Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredVideos.map(video => (
                    <Link to={`/watch/${video._id}`} key={video._id} className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors">
                      <div className="relative">
                        <img 
                          src={video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `http://localhost:5000${video.thumbnailUrl}`} 
                          alt={video.title} 
                          className="w-full h-48 object-cover"
                        />
                        {video.type === 'short' && (
                          <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                            Short
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-gray-100 line-clamp-2">{video.title}</h3>
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

export default Subscriptions;
