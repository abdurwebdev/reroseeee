import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeedSidebar from '../components/FeedSidebar';
import { FaCut, FaPlay, FaTrash, FaShare, FaEdit } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const YourClips = () => {
  const [user, setUser] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(storedUser);

    // Fetch user's clips
    const fetchClips = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/library/clips`, {
          withCredentials: true
        });

        if (res.data.success) {
          setClips(res.data.clips);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clips:', err);
        showErrorToast('Failed to load clips');
        setLoading(false);
      }
    };

    // Fetch user's subscriptions for sidebar
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/subscriptions/user-subscriptions`, {
          withCredentials: true
        });

        if (res.data.success) {
          setSubscriptions(res.data.subscriptions);
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
      }
    };

    fetchClips();
    fetchSubscriptions();
  }, [navigate]);

  const handleDeleteClip = async (clipId) => {
    if (!window.confirm('Are you sure you want to delete this clip?')) {
      return;
    }

    try {
      const res = await axios.delete(`${API_URL}/api/library/clips/${clipId}`, {
        withCredentials: true
      });

      if (res.data.success) {
        showSuccessToast('Clip deleted successfully');
        setClips(clips.filter(clip => clip._id !== clipId));
      }
    } catch (err) {
      console.error('Error deleting clip:', err);
      showErrorToast('Failed to delete clip');
    }
  };

  const handleShareClip = async (clipId) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/clip/${clipId}`);
      showSuccessToast('Clip link copied to clipboard');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      showErrorToast('Failed to copy link');
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="flex">
        <FeedSidebar subscriptions={subscriptions} />

        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Clips</h1>
            <Link
              to="/create-clip"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaCut className="mr-2" /> Create New Clip
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : clips.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FaCut className="mx-auto text-4xl text-gray-500 mb-4" />
              <h2 className="text-xl mb-4">No clips yet</h2>
              <p className="text-gray-400 mb-6">Create clips from your favorite videos to share specific moments</p>
              <Link to="/create-clip" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                Create Your First Clip
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clips.map(clip => (
                <div key={clip._id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="relative h-40 bg-gray-700">
                    {clip.thumbnailUrl ? (
                      <img
                        src={clip.thumbnailUrl}
                        alt={clip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaPlay className="text-4xl text-gray-500" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                      {formatDuration(clip.duration)}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <Link to={`/clip/${clip._id}`} className="text-lg font-semibold hover:text-blue-400 line-clamp-2">
                        {clip.title}
                      </Link>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShareClip(clip._id)}
                          className="text-gray-400 hover:text-white"
                          title="Share clip"
                        >
                          <FaShare />
                        </button>
                        <button
                          onClick={() => navigate(`/edit-clip/${clip._id}`)}
                          className="text-gray-400 hover:text-white"
                          title="Edit clip"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClip(clip._id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete clip"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <span>From: </span>
                      <Link to={`/watch/${clip.sourceVideoId}`} className="ml-1 hover:text-blue-400 line-clamp-1">
                        {clip.sourceVideoTitle}
                      </Link>
                    </div>

                    {clip.description && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{clip.description}</p>
                    )}

                    <p className="text-gray-500 text-xs mt-3">
                      Created: {formatDate(clip.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default YourClips;
