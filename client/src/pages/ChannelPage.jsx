import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChannelHeader from '../components/ChannelHeader';
import ChannelTabs from '../components/ChannelTabs';
import ChannelVideos from '../components/ChannelVideos';
import ChannelAbout from '../components/ChannelAbout';
import ChannelCommunity from '../components/ChannelCommunity';
import { showErrorToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChannelPage = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [livestreams, setLivestreams] = useState([]);
  const [endedLivestreams, setEndedLivestreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch channel data
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(storedUser);
        
        // Check if current user is the channel owner
        if (storedUser && storedUser._id === channelId) {
          setIsOwner(true);
        }

        // Fetch channel info
        const channelRes = await axios.get(`${API_URL}/api/channels/${channelId}`);
        if (channelRes.data.success) {
          setChannel(channelRes.data.channel);
        } else {
          throw new Error('Failed to fetch channel information');
        }

        // Fetch videos
        const videosRes = await axios.get(`${API_URL}/api/channels/${channelId}/videos?type=video`);
        if (videosRes.data.success) {
          setVideos(videosRes.data.videos);
        }

        // Fetch shorts
        const shortsRes = await axios.get(`${API_URL}/api/channels/${channelId}/videos?type=short`);
        if (shortsRes.data.success) {
          setShorts(shortsRes.data.videos);
        }

        // Fetch active livestreams
        const liveRes = await axios.get(`${API_URL}/api/channels/${channelId}/livestreams?status=active`);
        if (liveRes.data.success) {
          setLivestreams(liveRes.data.livestreams);
        }

        // Fetch ended livestreams
        const endedLiveRes = await axios.get(`${API_URL}/api/channels/${channelId}/livestreams?status=ended`);
        if (endedLiveRes.data.success) {
          setEndedLivestreams(endedLiveRes.data.livestreams);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching channel data:', err);
        setError(err.message || 'Failed to load channel data');
        showErrorToast(err.message || 'Failed to load channel data');
        setLoading(false);
      }
    };

    if (channelId) {
      fetchChannelData();
    }
  }, [channelId]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-8">
            {/* Live section */}
            {livestreams.length > 0 && (
              <ChannelVideos 
                title="Live Now" 
                videos={livestreams} 
                type="livestream" 
                emptyMessage="No active livestreams" 
              />
            )}
            
            {/* Videos section */}
            <ChannelVideos 
              title="Videos" 
              videos={videos.slice(0, 8)} 
              type="video" 
              emptyMessage="No videos uploaded yet" 
              showMoreLink={videos.length > 8 ? () => handleTabChange('videos') : null}
            />
            
            {/* Shorts section */}
            {shorts.length > 0 && (
              <ChannelVideos 
                title="Shorts" 
                videos={shorts.slice(0, 8)} 
                type="short" 
                emptyMessage="No shorts uploaded yet" 
                showMoreLink={shorts.length > 8 ? () => handleTabChange('shorts') : null}
              />
            )}
            
            {/* Ended livestreams */}
            {endedLivestreams.length > 0 && (
              <ChannelVideos 
                title="Past Live Streams" 
                videos={endedLivestreams.slice(0, 4)} 
                type="ended-livestream" 
                emptyMessage="No past livestreams" 
                showMoreLink={endedLivestreams.length > 4 ? () => handleTabChange('live') : null}
              />
            )}
          </div>
        );
      
      case 'videos':
        return (
          <ChannelVideos 
            title="Videos" 
            videos={videos} 
            type="video" 
            emptyMessage="No videos uploaded yet" 
            showAll
          />
        );
      
      case 'shorts':
        return (
          <ChannelVideos 
            title="Shorts" 
            videos={shorts} 
            type="short" 
            emptyMessage="No shorts uploaded yet" 
            showAll
          />
        );
      
      case 'live':
        return (
          <div className="space-y-8">
            {livestreams.length > 0 && (
              <ChannelVideos 
                title="Live Now" 
                videos={livestreams} 
                type="livestream" 
                emptyMessage="No active livestreams" 
                showAll
              />
            )}
            <ChannelVideos 
              title="Past Live Streams" 
              videos={endedLivestreams} 
              type="ended-livestream" 
              emptyMessage="No past livestreams" 
              showAll
            />
          </div>
        );
      
      case 'community':
        return (
          <ChannelCommunity channelId={channelId} isOwner={isOwner} />
        );
      
      case 'about':
        return (
          <ChannelAbout channel={channel} />
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white">
        {channel && (
          <>
            <ChannelHeader 
              channel={channel} 
              isOwner={isOwner} 
              currentUser={currentUser}
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ChannelTabs 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                hasShorts={shorts.length > 0}
                hasLive={livestreams.length > 0 || endedLivestreams.length > 0}
              />
              
              <div className="mt-6">
                {renderTabContent()}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ChannelPage;
