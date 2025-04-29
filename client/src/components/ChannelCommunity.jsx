import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaImage } from 'react-icons/fa';
import CommunityPost from './CommunityPost';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChannelCommunity = ({ channelId, isOwner }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch community posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(storedUser);
        
        const response = await axios.get(`${API_URL}/api/channels/${channelId}/community`);
        
        if (response.data.success) {
          setPosts(response.data.posts);
        } else {
          throw new Error('Failed to fetch community posts');
        }
      } catch (err) {
        console.error('Error fetching community posts:', err);
        setError(err.message || 'Failed to load community posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [channelId]);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setPostImage(null);
    setImagePreview(null);
  };

  // Create post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!postText.trim() && !postImage) {
      showErrorToast('Please add text or an image to your post');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('text', postText);
      
      if (postImage) {
        formData.append('image', postImage);
      }
      
      const response = await axios.post(
        `${API_URL}/api/channels/community/post`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      
      if (response.data.success) {
        showSuccessToast('Post created successfully');
        
        // Add new post to the list
        setPosts([response.data.post, ...posts]);
        
        // Reset form
        setPostText('');
        setPostImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      showErrorToast(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle post deletion
  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  // Refresh posts
  const refreshPosts = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/api/channels/${channelId}/community`);
      
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      console.error('Error refreshing posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="py-6">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={refreshPosts}
          className="mt-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Post creation form (only for channel owner) */}
      {isOwner && (
        <div className="bg-gray-900 rounded-lg p-4 mb-8">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share something with your audience..."
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              rows={3}
            />
            
            {/* Image preview */}
            {imagePreview && (
              <div className="relative mb-3">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-60 rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full"
                >
                  &times;
                </button>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2 text-gray-400 hover:text-white cursor-pointer">
                <FaImage />
                <span>Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              
              <button
                type="submit"
                disabled={submitting || (!postText.trim() && !postImage)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Posts list */}
      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <CommunityPost
              key={post._id}
              post={post}
              currentUser={currentUser}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No community posts yet.</p>
          {isOwner && (
            <p className="text-gray-500 mt-2">
              Create your first post to engage with your audience!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelCommunity;
