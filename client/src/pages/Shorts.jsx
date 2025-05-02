import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FeedSidebar from '../components/FeedSidebar';
import { FaPlay, FaSearch } from 'react-icons/fa';

const API_URL = "http://localhost:5000";

const Shorts = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    
    // Fetch shorts
    const fetchShorts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/free-videos/feed", {
          withCredentials: true,
        });
        
        // Filter only shorts
        const shortsData = res.data.filter(video => video.type === "short");
        setShorts(shortsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shorts:', err);
        setError('Failed to load shorts');
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
    
    fetchShorts();
    fetchSubscriptions();
  }, []);
  
  // Filter shorts based on search term
  const filteredShorts = shorts.filter(short => 
    short.title.toLowerCase().includes(searchTerm.toLowerCase())
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
              <FaPlay className="text-red-500 text-2xl mr-2" />
              <h1 className="text-2xl font-bold">Shorts</h1>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shorts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-full text-black bg-white outline-none border border-gray-300 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            
            {/* Upload button */}
            <div className="flex justify-center mb-6">
              <Link to="/upload-short" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Upload Short
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading shorts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredShorts.length === 0 ? (
              <div className="text-center py-10">
                {searchTerm ? (
                  <p>No shorts found matching "{searchTerm}"</p>
                ) : (
                  <>
                    <p className="text-xl mb-2">No shorts available</p>
                    <p className="text-gray-400">Be the first to upload a short!</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredShorts.map(short => (
                  <Link to={`/watch/${short._id}`} key={short._id} className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors">
                    <div className="relative pb-[177%]"> {/* Vertical aspect ratio for shorts */}
                      <img 
                        src={short.thumbnailUrl.startsWith('http') ? short.thumbnailUrl : `http://localhost:5000${short.thumbnailUrl}`} 
                        alt={short.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-100 line-clamp-2">{short.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{short.views} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shorts;
