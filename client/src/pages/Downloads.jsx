import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeedSidebar from '../components/FeedSidebar';
import { FaDownload, FaPlay, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const Downloads = () => {
  const [user, setUser] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(1024 * 1024 * 1024); // 1GB default
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // Fetch user's downloads
    const fetchDownloads = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/library/downloads`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setDownloads(res.data.downloads);
          setStorageUsed(res.data.storageUsed || 0);
          setStorageLimit(res.data.storageLimit || 1024 * 1024 * 1024);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching downloads:', err);
        showErrorToast('Failed to load downloads');
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
    
    fetchDownloads();
    fetchSubscriptions();
  }, [navigate]);

  const handleDeleteDownload = async (downloadId) => {
    if (!window.confirm('Are you sure you want to delete this download?')) {
      return;
    }
    
    try {
      const res = await axios.delete(`${API_URL}/api/library/downloads/${downloadId}`, {
        withCredentials: true
      });
      
      if (res.data.success) {
        showSuccessToast('Download deleted successfully');
        setDownloads(downloads.filter(download => download._id !== downloadId));
        setStorageUsed(res.data.storageUsed || storageUsed);
      }
    } catch (err) {
      console.error('Error deleting download:', err);
      showErrorToast('Failed to delete download');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStoragePercentage = () => {
    return Math.min(100, Math.round((storageUsed / storageLimit) * 100));
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="flex">
        <FeedSidebar subscriptions={subscriptions} />
        
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Your Downloads</h1>
          
          {/* Storage Usage */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Storage Used</h3>
              <span>{formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  getStoragePercentage() > 90 ? 'bg-red-600' : 
                  getStoragePercentage() > 70 ? 'bg-yellow-500' : 
                  'bg-green-600'
                }`} 
                style={{ width: `${getStoragePercentage()}%` }}
              ></div>
            </div>
            {getStoragePercentage() > 90 && (
              <div className="mt-2 text-red-400 text-sm flex items-center">
                <FaExclamationTriangle className="mr-1" />
                <span>Storage almost full! Delete some downloads to free up space.</span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : downloads.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FaDownload className="mx-auto text-4xl text-gray-500 mb-4" />
              <h2 className="text-xl mb-4">No downloads yet</h2>
              <p className="text-gray-400 mb-6">Videos you download will appear here</p>
              <Link to="/feed" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                Browse Videos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloads.map(download => (
                <div key={download._id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="relative h-40 bg-gray-700">
                    {download.video.thumbnailUrl ? (
                      <img 
                        src={download.video.thumbnailUrl} 
                        alt={download.video.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaPlay className="text-4xl text-gray-500" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
                      {formatFileSize(download.fileSize)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <Link to={`/watch/${download.video._id}`} className="text-lg font-semibold hover:text-blue-400 line-clamp-2">
                        {download.video.title}
                      </Link>
                      <button 
                        onClick={() => handleDeleteDownload(download._id)}
                        className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                        title="Delete download"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <Link to={`/channel/${download.video.uploaderId}`} className="hover:text-blue-400">
                        {download.video.uploader}
                      </Link>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <span>Downloaded: {formatDate(download.downloadedAt)}</span>
                      <a 
                        href={download.localUrl} 
                        download
                        className="flex items-center text-blue-400 hover:text-blue-300"
                      >
                        <FaPlay className="mr-1" /> Play
                      </a>
                    </div>
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

export default Downloads;
