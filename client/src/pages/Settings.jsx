import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaUser, FaLock, FaEnvelope, FaBell, FaGlobe, FaShieldAlt, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    subscriptionUpdates: true,
    commentReplies: true,
    videoRecommendations: false,
    marketingEmails: false
  });
  const [privacySettings, setPrivacySettings] = useState({
    showSubscriptions: true,
    showLikedVideos: true,
    showSavedPlaylists: true,
    allowRecommendations: true
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // Fetch user settings
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/users/settings`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          const userData = res.data.user;
          
          // Set profile data
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            bio: userData.bio || '',
            location: userData.location || '',
            website: userData.website || ''
          });
          
          // Set notification settings
          if (userData.notificationSettings) {
            setNotificationSettings(userData.notificationSettings);
          }
          
          // Set privacy settings
          if (userData.privacySettings) {
            setPrivacySettings(userData.privacySettings);
          }
          
          // Set profile image preview
          if (userData.profileImageUrl) {
            setProfileImagePreview(userData.profileImageUrl);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user settings:', err);
        showErrorToast('Failed to load user settings');
        setLoading(false);
      }
    };
    
    fetchUserSettings();
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: checked
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('bio', profileData.bio);
      formData.append('location', profileData.location);
      formData.append('website', profileData.website);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      const res = await axios.put(`${API_URL}/api/users/profile`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        showSuccessToast('Profile updated successfully');
        
        // Update local storage user data
        const updatedUser = { ...user, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showErrorToast(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorToast('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showErrorToast('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const res = await axios.put(`${API_URL}/api/users/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });
      
      if (res.data.success) {
        showSuccessToast('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Error updating password:', err);
      showErrorToast(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.put(`${API_URL}/api/users/notifications`, {
        notificationSettings
      }, {
        withCredentials: true
      });
      
      if (res.data.success) {
        showSuccessToast('Notification settings updated successfully');
      }
    } catch (err) {
      console.error('Error updating notification settings:', err);
      showErrorToast('Failed to update notification settings');
    }
  };

  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.put(`${API_URL}/api/users/privacy`, {
        privacySettings
      }, {
        withCredentials: true
      });
      
      if (res.data.success) {
        showSuccessToast('Privacy settings updated successfully');
      }
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      showErrorToast('Failed to update privacy settings');
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-900 rounded-lg p-4">
            <ul>
              <li 
                className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center ${activeTab === 'profile' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="mr-3" /> Profile
              </li>
              <li 
                className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center ${activeTab === 'password' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                onClick={() => setActiveTab('password')}
              >
                <FaLock className="mr-3" /> Password
              </li>
              <li 
                className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center ${activeTab === 'notifications' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className="mr-3" /> Notifications
              </li>
              <li 
                className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center ${activeTab === 'privacy' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                onClick={() => setActiveTab('privacy')}
              >
                <FaShieldAlt className="mr-3" /> Privacy
              </li>
            </ul>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 bg-gray-900 rounded-lg p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit}>
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                
                <div className="mb-6 flex flex-col items-center">
                  <div 
                    className="w-24 h-24 rounded-full bg-gray-700 mb-4 overflow-hidden relative cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-3xl">
                        {profileData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-sm">Change Photo</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfileImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="w-full bg-gray-700 text-gray-400 px-4 py-2 rounded cursor-not-allowed"
                    disabled
                  />
                  <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded"
                    placeholder="https://example.com"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  Save Changes
                </button>
              </form>
            )}
            
            {/* Password Settings */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded pr-10"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Password must be at least 6 characters long</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  Update Password
                </button>
              </form>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleNotificationSubmit}>
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Subscription Updates</h3>
                      <p className="text-gray-400 text-sm">Get notified when channels you subscribe to upload new content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="subscriptionUpdates"
                        checked={notificationSettings.subscriptionUpdates}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Comment Replies</h3>
                      <p className="text-gray-400 text-sm">Get notified when someone replies to your comments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="commentReplies"
                        checked={notificationSettings.commentReplies}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Video Recommendations</h3>
                      <p className="text-gray-400 text-sm">Receive personalized video recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="videoRecommendations"
                        checked={notificationSettings.videoRecommendations}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-gray-400 text-sm">Receive promotional emails and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={notificationSettings.marketingEmails}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mt-6"
                >
                  Save Preferences
                </button>
              </form>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <form onSubmit={handlePrivacySubmit}>
                <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Show Subscriptions</h3>
                      <p className="text-gray-400 text-sm">Allow others to see channels you're subscribed to</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="showSubscriptions"
                        checked={privacySettings.showSubscriptions}
                        onChange={handlePrivacyChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Show Liked Videos</h3>
                      <p className="text-gray-400 text-sm">Allow others to see videos you've liked</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="showLikedVideos"
                        checked={privacySettings.showLikedVideos}
                        onChange={handlePrivacyChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Show Saved Playlists</h3>
                      <p className="text-gray-400 text-sm">Allow others to see your playlists</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="showSavedPlaylists"
                        checked={privacySettings.showSavedPlaylists}
                        onChange={handlePrivacyChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-medium">Allow Recommendations</h3>
                      <p className="text-gray-400 text-sm">Allow your watch history to be used for recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="allowRecommendations"
                        checked={privacySettings.allowRecommendations}
                        onChange={handlePrivacyChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mt-6"
                >
                  Save Privacy Settings
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Settings;
