import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeedSidebar from '../components/FeedSidebar';
import { FaPlus, FaEdit, FaTrash, FaPlay } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const Playlists = () => {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
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
    
    // Fetch user's playlists
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/library/playlists`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setPlaylists(res.data.playlists);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        showErrorToast('Failed to load playlists');
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
    
    fetchPlaylists();
    fetchSubscriptions();
  }, [navigate]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!newPlaylistName.trim()) {
      showErrorToast('Please enter a playlist name');
      return;
    }
    
    try {
      const res = await axios.post(`${API_URL}/api/library/playlists`, {
        name: newPlaylistName,
        description: newPlaylistDescription
      }, {
        withCredentials: true
      });
      
      if (res.data.success) {
        showSuccessToast('Playlist created successfully');
        setPlaylists([...playlists, res.data.playlist]);
        setShowCreateModal(false);
        setNewPlaylistName('');
        setNewPlaylistDescription('');
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
      showErrorToast(err.response?.data?.message || 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }
    
    try {
      const res = await axios.delete(`${API_URL}/api/library/playlists/${playlistId}`, {
        withCredentials: true
      });
      
      if (res.data.success) {
        showSuccessToast('Playlist deleted successfully');
        setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
      }
    } catch (err) {
      console.error('Error deleting playlist:', err);
      showErrorToast('Failed to delete playlist');
    }
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
            <h1 className="text-2xl font-bold">Your Playlists</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" /> Create Playlist
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : playlists.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <h2 className="text-xl mb-4">You don't have any playlists yet</h2>
              <p className="text-gray-400 mb-6">Create playlists to organize your favorite videos</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Create Your First Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map(playlist => (
                <div key={playlist._id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="relative h-40 bg-gray-700">
                    {playlist.thumbnailUrl ? (
                      <img 
                        src={playlist.thumbnailUrl} 
                        alt={playlist.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaPlay className="text-4xl text-gray-500" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                      {playlist.videos?.length || 0} videos
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <Link to={`/playlist/${playlist._id}`} className="text-lg font-semibold hover:text-blue-400">
                        {playlist.name}
                      </Link>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/edit-playlist/${playlist._id}`)}
                          className="text-gray-400 hover:text-white"
                          title="Edit playlist"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDeletePlaylist(playlist._id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete playlist"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    {playlist.description && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{playlist.description}</p>
                    )}
                    
                    <p className="text-gray-500 text-xs mt-3">
                      Last updated: {formatDate(playlist.updatedAt || playlist.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
            
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Playlists;
