import React, { useState } from 'react';
import { FaCamera, FaEdit, FaUser } from 'react-icons/fa';
import axios from 'axios';
import ChannelSubscribe from './ChannelSubscribe';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChannelHeader = ({ channel, isOwner, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle profile image change
  const handleProfileImageChange = (e) => {
    console.log('Profile image change triggered', e);
    const file = e.target.files[0];
    if (file) {
      console.log('Profile file selected:', file.name);
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Profile image preview created');
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No profile file selected');
    }
  };

  // Handle banner image change
  const handleBannerImageChange = (e) => {
    console.log('Banner image change triggered', e);
    const file = e.target.files[0];
    if (file) {
      console.log('Banner file selected:', file.name);
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Banner image preview created');
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No banner file selected');
    }
  };

  // Save channel changes
  const saveChanges = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      if (profileImage) {
        console.log('Adding profile image to form data:', profileImage.name);
        formData.append('profileImage', profileImage);
      }

      if (bannerImage) {
        console.log('Adding banner image to form data:', bannerImage.name);
        formData.append('bannerImage', bannerImage);
      }

      // Log form data entries
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.put(
        `${API_URL}/api/channels/update`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Update local storage with new user data
        const updatedUser = {
          ...currentUser,
          profileImageUrl: response.data.user.profileImageUrl,
          bannerImageUrl: response.data.user.bannerImageUrl
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        showSuccessToast('Channel updated successfully');
        setIsEditing(false);

        // Reload the page to show updated images
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating channel:', error);
      showErrorToast(error.response?.data?.message || 'Failed to update channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div
        className="w-full h-48 md:h-64 bg-gray-800 relative"
        style={
          bannerPreview
            ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : channel.bannerImageUrl
              ? { backgroundImage: `url(${API_URL}${channel.bannerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : {}
        }
      >
        {isOwner && isEditing && (
          <label
            className="absolute bottom-4 right-4 bg-black bg-opacity-70 p-2 rounded-full cursor-pointer z-10 hover:bg-gray-800"
            onClick={() => document.getElementById('banner-upload').click()}
          >
            <FaCamera className="text-white text-xl" />
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerImageChange}
              className="hidden"
              id="banner-upload"
            />
          </label>
        )}
      </div>

      {/* Channel Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16 md:-mt-20">
          {/* Profile Image */}
          <div className="relative">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black overflow-hidden bg-gray-700 flex items-center justify-center"
              style={
                profilePreview
                  ? { backgroundImage: `url(${profilePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : channel.profileImageUrl
                    ? { backgroundImage: `url(${API_URL}${channel.profileImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : {}
              }
            >
              {!profilePreview && !channel.profileImageUrl && (
                <FaUser className="text-4xl text-gray-400" />
              )}
            </div>

            {isOwner && isEditing && (
              <label
                className="absolute bottom-0 right-0 bg-black bg-opacity-70 p-2 rounded-full cursor-pointer z-10 hover:bg-gray-800"
                onClick={() => document.getElementById('profile-upload').click()}
              >
                <FaCamera className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-upload"
                />
              </label>
            )}
          </div>

          {/* Channel Name and Stats */}
          <div className="flex-1 pb-4">
            <h1 className="text-2xl md:text-3xl font-bold">{channel.name}</h1>
            <div className="text-gray-400 mt-1">
              
            </div>
          </div>

          {/* Subscribe Button or Edit Button */}
          <div className="pb-4">
            {isOwner ? (
              isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={saveChanges}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                >
                  <FaEdit />
                  <span>Customize Channel</span>
                </button>
              )
            ) : (
              currentUser && (
                <ChannelSubscribe
                  channelId={channel._id}
                  channelName={channel.name}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
