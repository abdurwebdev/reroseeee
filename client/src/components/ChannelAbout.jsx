import React, { useState } from 'react';
import { FaEdit, FaGlobe, FaTwitter, FaInstagram, FaFacebook, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to format view count
const formatViews = (views) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  } else {
    return views.toString();
  }
};

const ChannelAbout = ({ channel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(channel.channelDescription || '');
  const [location, setLocation] = useState(channel.location || '');
  const [website, setWebsite] = useState(channel.socialLinks?.website || '');
  const [twitter, setTwitter] = useState(channel.socialLinks?.twitter || '');
  const [instagram, setInstagram] = useState(channel.socialLinks?.instagram || '');
  const [facebook, setFacebook] = useState(channel.socialLinks?.facebook || '');
  const [loading, setLoading] = useState(false);

  // Check if current user is the channel owner
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwner = currentUser && currentUser._id === channel._id;

  // Save channel info
  const saveChannelInfo = async () => {
    try {
      setLoading(true);
      
      const response = await axios.put(
        `${API_URL}/api/channels/update`,
        {
          channelDescription: description,
          location,
          website,
          twitter,
          instagram,
          facebook
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        showSuccessToast('Channel information updated successfully');
        setIsEditing(false);
        
        // Update local storage
        const updatedUser = {
          ...currentUser,
          channelDescription: description,
          location,
          socialLinks: {
            website,
            twitter,
            instagram,
            facebook
          }
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Reload the page to show updated info
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating channel info:', error);
      showErrorToast(error.response?.data?.message || 'Failed to update channel information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Description */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Description</h3>
          {isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-400 flex items-center"
            >
              <FaEdit className="mr-1" /> Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your channel..."
              className="w-full h-40 bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Twitter</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter username or URL"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram username or URL"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Facebook</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook page URL"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={saveChannelInfo}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 whitespace-pre-line">
              {channel.channelDescription || 'No description provided.'}
            </p>
            
            {/* Links */}
            {(channel.location || channel.socialLinks?.website || channel.socialLinks?.twitter || 
              channel.socialLinks?.instagram || channel.socialLinks?.facebook) && (
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold mb-3">Links</h3>
                
                {channel.location && (
                  <div className="flex items-center text-gray-300">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span>{channel.location}</span>
                  </div>
                )}
                
                {channel.socialLinks?.website && (
                  <div className="flex items-center">
                    <FaGlobe className="mr-2 text-gray-400" />
                    <a 
                      href={channel.socialLinks.website.startsWith('http') ? channel.socialLinks.website : `https://${channel.socialLinks.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      {channel.socialLinks.website}
                    </a>
                  </div>
                )}
                
                {channel.socialLinks?.twitter && (
                  <div className="flex items-center">
                    <FaTwitter className="mr-2 text-gray-400" />
                    <a 
                      href={channel.socialLinks.twitter.startsWith('http') ? channel.socialLinks.twitter : `https://twitter.com/${channel.socialLinks.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      {channel.socialLinks.twitter}
                    </a>
                  </div>
                )}
                
                {channel.socialLinks?.instagram && (
                  <div className="flex items-center">
                    <FaInstagram className="mr-2 text-gray-400" />
                    <a 
                      href={channel.socialLinks.instagram.startsWith('http') ? channel.socialLinks.instagram : `https://instagram.com/${channel.socialLinks.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      {channel.socialLinks.instagram}
                    </a>
                  </div>
                )}
                
                {channel.socialLinks?.facebook && (
                  <div className="flex items-center">
                    <FaFacebook className="mr-2 text-gray-400" />
                    <a 
                      href={channel.socialLinks.facebook.startsWith('http') ? channel.socialLinks.facebook : `https://facebook.com/${channel.socialLinks.facebook}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      {channel.socialLinks.facebook}
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Stats</h3>
        <div className="bg-gray-900 rounded-lg p-4 space-y-4">
          <div>
            <p className="text-gray-400">Joined</p>
            <p className="text-lg">{formatDate(channel.channelJoinDate || channel.createdAt || Date.now())}</p>
          </div>
          
          <div>
            <p className="text-gray-400">Total views</p>
            <p className="text-lg">{formatViews(channel.totalViews || 0)}</p>
          </div>
          
          <div>
            <p className="text-gray-400">Subscribers</p>
            <p className="text-lg">{formatViews(channel.subscriberCount || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelAbout;
