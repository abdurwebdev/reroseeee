import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LivestreamPlayer from '../components/LivestreamPlayer';

const WatchLivestream = () => {
  const { id } = useParams();
  const [livestream, setLivestream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    const fetchLivestream = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/livestream/${id}`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setLivestream(response.data.data);
        } else {
          setError('Failed to load livestream');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching livestream:', err);
        setError(err.response?.data?.error || 'Failed to load livestream');
        setLoading(false);
      }
    };

    fetchLivestream();

    // Set up polling to check for status updates
    const intervalId = setInterval(fetchLivestream, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Loading Livestream...</h1>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !livestream) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Error</h1>
          <div className="bg-red-500 text-white p-4 rounded-md">
            {error || 'Livestream not found'}
          </div>
          <Link to="/feed" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            Back to Feed
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Stream Status Banner */}
        {livestream.status === 'active' ? (
          <div className="bg-red-600 text-white text-center py-2 px-4 rounded-t-md font-medium">
            LIVE NOW
          </div>
        ) : (
          <div className="bg-gray-700 text-white text-center py-2 px-4 rounded-t-md font-medium">
            {livestream.endedAt ? 'RECORDED STREAM' : 'STREAM NOT STARTED'}
          </div>
        )}
        
        {/* Video Player */}
        <div className="w-full bg-gray-900 aspect-video">
          {livestream.status === 'active' || livestream.endedAt ? (
            <LivestreamPlayer playbackUrl={livestream.playbackUrl} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">This stream hasn't started yet.</p>
            </div>
          )}
        </div>
        
        {/* Stream Info */}
        <div className="bg-[#111111] p-4 rounded-b-md mb-6">
          <h1 className="text-2xl font-bold">{livestream.name}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 mt-2 text-sm text-gray-400">
            <span>
              Streamer: {livestream.user?.name || 'Anonymous'}
            </span>
            <span>•</span>
            <span>
              {livestream.status === 'active' 
                ? `Started ${formatDate(livestream.startedAt)}` 
                : livestream.endedAt 
                  ? `Ended ${formatDate(livestream.endedAt)}` 
                  : 'Not started yet'
              }
            </span>
            <span>•</span>
            <span>
              {livestream.isScreenSharing ? 'Screen Sharing' : 'Video Stream'}
            </span>
          </div>
          
          {user && user._id === livestream.user?._id && (
            <div className="mt-4">
              <Link 
                to="/live-course" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Manage Stream
              </Link>
            </div>
          )}
        </div>
        
        {/* Related Streams */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">More Livestreams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-[#111111] p-4 rounded-md text-center">
              <Link to="/feed" className="text-blue-400 hover:underline">
                Browse all livestreams
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WatchLivestream;
