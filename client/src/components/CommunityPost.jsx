import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaEllipsisV, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }
};

const CommunityPost = ({ post, currentUser, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if current user is the post owner
  const isOwner = currentUser && post.userId._id === currentUser._id;

  // Toggle like
  const handleLike = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/api/channels/community/post/${post._id}/like`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikeCount(response.data.likes);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      showErrorToast('Failed to like post');
    } finally {
      setLoading(false);
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/api/channels/community/post/${post._id}/comment`,
        { text: commentText },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        showSuccessToast('Comment added');
        setCommentText('');
        // Refresh post data (handled by parent component)
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showErrorToast('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!isOwner) return;
    
    try {
      setLoading(true);
      
      const response = await axios.delete(
        `${API_URL}/api/channels/community/post/${post._id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        showSuccessToast('Post deleted');
        if (onDelete) onDelete(post._id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showErrorToast('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-6">
      {/* Post header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <Link to={`/channel/${post.userId._id}`} className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3">
              {post.userId.profileImageUrl ? (
                <img 
                  src={`${API_URL}${post.userId.profileImageUrl}`} 
                  alt={post.userId.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {post.userId.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{post.userId.name}</p>
              <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
            </div>
          </Link>
        </div>
        
        {isOwner && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white p-1"
            >
              <FaEllipsisV />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-md shadow-lg z-10">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                >
                  <FaTrash className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Post content */}
      <div className="mb-4">
        <p className="text-gray-200 whitespace-pre-line">{post.text}</p>
        
        {post.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={`${API_URL}${post.imageUrl}`} 
              alt="Post" 
              className="w-full max-h-96 object-contain"
            />
          </div>
        )}
      </div>
      
      {/* Post actions */}
      <div className="flex items-center space-x-4 border-t border-gray-800 pt-3">
        <button
          onClick={handleLike}
          disabled={!currentUser || loading}
          className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500`}
        >
          {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
          <span>{likeCount}</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-gray-400 hover:text-white"
        >
          <FaComment />
          <span>{post.comments.length}</span>
        </button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-800 pt-4">
          {/* Comment form */}
          {currentUser && (
            <form onSubmit={handleAddComment} className="mb-4 flex">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-l p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Post
              </button>
            </form>
          )}
          
          {/* Comments list */}
          <div className="space-y-4">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    {/* Would need to populate user profile image here */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{comment.username}</p>
                      <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="text-sm text-gray-300">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No comments yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPost;
