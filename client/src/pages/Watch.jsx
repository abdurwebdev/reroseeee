import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChannelSubscribe from "../components/ChannelSubscribe";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import {
  FaSearch, FaShare, FaDownload,
  FaThumbsUp, FaThumbsDown, FaRegThumbsUp,
  FaRegThumbsDown, FaBell, FaReply,
  FaEllipsisV, FaTrash, FaClock
} from "react-icons/fa";

const API_URL = "http://localhost:5000"; // Change this to your API URL

const Watch = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [originalSuggestions, setOriginalSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  // Search state
  const [isSearching, setIsSearching] = useState(false);

  // Uploader state
  const [uploaderInfo, setUploaderInfo] = useState(null);

  // Like/dislike states
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Subscribe state
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Watch later state
  const [inWatchLater, setInWatchLater] = useState(false);
  const [isWatchLaterLoading, setIsWatchLaterLoading] = useState(false);

  // User state
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Then verify with server (if you have a verify endpoint)
        const res = await axios.get(`${API_URL}/api/users/profile`, {
          withCredentials: true,
        });

        if (res.data) {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        }
      } catch (err) {
        console.log("User not logged in or authentication failed:", err.message);
      }
    };
    checkAuthStatus();
  }, []);

  // Video player reference for tracking watch time
  const videoRef = React.useRef(null);
  const [watchTime, setWatchTime] = useState(0);
  const [watchTimeInterval, setWatchTimeInterval] = useState(null);

  // Start tracking watch time when video plays
  const handleVideoPlay = () => {
    if (!user || !videoRef.current) return;

    // Clear any existing interval
    if (watchTimeInterval) {
      clearInterval(watchTimeInterval);
    }

    // Set up interval to track watch time every 5 seconds
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setWatchTime(prev => prev + 5);
      }
    }, 5000);

    setWatchTimeInterval(interval);
  };

  // Stop tracking watch time when video pauses
  const handleVideoPause = () => {
    if (watchTimeInterval) {
      clearInterval(watchTimeInterval);
      setWatchTimeInterval(null);
    }
  };

  // Record watch history when component unmounts or video changes
  useEffect(() => {
    return () => {
      // Clean up interval
      if (watchTimeInterval) {
        clearInterval(watchTimeInterval);
      }

      // Record watch history if user is logged in and has watched for at least 5 seconds
      if (user && watchTime >= 5 && video) {
        axios.post(`${API_URL}/api/library/history`, {
          videoId: id,
          watchTimeSeconds: watchTime
        }, { withCredentials: true })
          .catch(err => console.error("Error recording watch history:", err));
      }
    };
  }, [id, user, watchTime, video, watchTimeInterval]);

  // Fetch video and suggested videos
  useEffect(() => {
    const fetchVideoAndSuggestions = async () => {
      try {
        // Fetch the main video
        const videoRes = await axios.get(`${API_URL}/api/free-videos/${id}`);
        setVideo(videoRes.data);

        // Set like/dislike information
        if (videoRes.data) {
          setLikeCount(videoRes.data.likes?.length || 0);
          setDislikeCount(videoRes.data.dislikes?.length || 0);

          // Check if current user has liked/disliked
          if (user && videoRes.data.likes && videoRes.data.dislikes) {
            setHasLiked(videoRes.data.likes.includes(user._id));
            setHasDisliked(videoRes.data.dislikes.includes(user._id));
          }

          // Record view for monetization
          try {
            await axios.post(`${API_URL}/api/earnings/record-video-view`, {
              videoId: id
            });
          } catch (err) {
            console.error("Error recording monetized view:", err);
            // Don't show error to user as this is a background process
          }
        }

        // Fetch uploader info and subscriber count
        if (videoRes.data.uploaderId) {
          try {
            // Get subscriber count for this uploader
            const subRes = await axios.get(`${API_URL}/api/subscriptions/count/${videoRes.data.uploaderId}`);
            if (subRes.data.success) {
              setSubscriberCount(subRes.data.subscriberCount);
            }

            // Get uploader profile info
            const uploaderRes = await axios.get(`${API_URL}/api/free-videos/${id}/uploader`);
            setUploaderInfo(uploaderRes.data);
          } catch (err) {
            console.error("Error fetching uploader info:", err);
          }
        }

        // Fetch suggested videos
        const feedRes = await axios.get(`${API_URL}/api/free-videos/feed`);
        const filteredVideos = feedRes.data.filter(v => v._id !== id).slice(0, 10);
        setSuggestedVideos(filteredVideos);
        setOriginalSuggestions(filteredVideos);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch video");
        setLoading(false);
      }
    };

    fetchVideoAndSuggestions();
  }, [id, user]);

  // Handle like
  const handleLike = async () => {
    if (!user) {
      showErrorToast("Please log in to like this video");
      return;
    }

    if (isLikeLoading) return;
    setIsLikeLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/free-videos/${id}/like`,
        {},
        { withCredentials: true }
      );

      setLikeCount(res.data.likes);
      setDislikeCount(res.data.dislikes);
      setHasLiked(res.data.hasLiked);
      setHasDisliked(res.data.hasDisliked);

      if (res.data.hasLiked) {
        showSuccessToast("Added to liked videos");
      }
    } catch (err) {
      console.error("Error liking video:", err);
      showErrorToast("Failed to like video. Please try again.");
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Handle dislike
  const handleDislike = async () => {
    if (!user) {
      showErrorToast("Please log in to dislike this video");
      return;
    }

    if (isLikeLoading) return;
    setIsLikeLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/free-videos/${id}/dislike`,
        {},
        { withCredentials: true }
      );

      setLikeCount(res.data.likes);
      setDislikeCount(res.data.dislikes);
      setHasLiked(res.data.hasLiked);
      setHasDisliked(res.data.hasDisliked);

      if (res.data.hasDisliked) {
        showSuccessToast("Added to disliked videos");
      }
    } catch (err) {
      console.error("Error disliking video:", err);
      showErrorToast("Failed to dislike video. Please try again.");
    } finally {
      setIsLikeLoading(false);
    }
  };



  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSuggestedVideos(originalSuggestions);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axios.get(`${API_URL}/api/free-videos/search`, {
        params: { q: searchQuery.trim() }
      });

      const filteredVideos = res.data.filter(v => v._id !== id).slice(0, 10);
      setSuggestedVideos(filteredVideos);
    } catch (err) {
      console.error("Error searching videos:", err);
      // Fallback to client-side filtering
      const filtered = originalSuggestions.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestedVideos(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle sharing
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccessToast("Video URL copied to clipboard!");
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      showErrorToast("Failed to copy URL. Please copy it manually.");
    }
  };

  // Handle watch later
  const handleWatchLater = async () => {
    if (!user) {
      showErrorToast("Please log in to add to Watch Later");
      return;
    }

    if (isWatchLaterLoading) return;
    setIsWatchLaterLoading(true);

    try {
      if (inWatchLater) {
        // Remove from watch later
        await axios.delete(`${API_URL}/api/library/watch-later/${id}`, {
          withCredentials: true
        });
        setInWatchLater(false);
        showSuccessToast("Removed from Watch Later");
      } else {
        // Add to watch later
        await axios.post(`${API_URL}/api/library/watch-later`, {
          videoId: id
        }, {
          withCredentials: true
        });
        setInWatchLater(true);
        showSuccessToast("Added to Watch Later");
      }
    } catch (err) {
      console.error("Error updating Watch Later:", err);
      showErrorToast("Failed to update Watch Later. Please try again.");
    } finally {
      setIsWatchLaterLoading(false);
    }
  };

  // Check if video is in watch later
  useEffect(() => {
    const checkWatchLater = async () => {
      if (!user || !id) return;

      try {
        const res = await axios.get(`${API_URL}/api/library/watch-later`, {
          withCredentials: true
        });

        if (res.data.success) {
          const isInWatchLater = res.data.watchLater.some(item =>
            item.video && item.video._id === id
          );
          setInWatchLater(isInWatchLater);
        }
      } catch (err) {
        console.error("Error checking watch later status:", err);
      }
    };

    checkWatchLater();
  }, [user, id]);

  // Add a comment
  const handleAddComment = async () => {
    if (!user) {
      alert("Please log in to comment");
      return;
    }

    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    setIsCommenting(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/free-videos/${id}/comment`,
        { text: commentText.trim() },
        { withCredentials: true }
      );

      // Update video state with new comment
      setVideo(prev => ({
        ...prev,
        comments: [...(prev.comments || []), res.data]
      }));

      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsCommenting(false);
    }
  };

  // Add a reply to a comment
  const handleAddReply = async () => {
    if (!user) {
      alert("Please log in to reply");
      return;
    }

    if (!replyingTo) {
      return;
    }

    if (!replyText.trim()) {
      alert("Please enter a reply");
      return;
    }

    setIsReplying(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/free-videos/${id}/comment/${replyingTo._id}/reply`,
        { text: replyText.trim() },
        { withCredentials: true }
      );

      // Update video state with new reply
      setVideo(prev => {
        const updatedComments = prev.comments.map(comment => {
          if (comment._id === replyingTo._id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), res.data]
            };
          }
          return comment;
        });

        return {
          ...prev,
          comments: updatedComments
        };
      });

      // Reset reply state
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Failed to add reply. Please try again.");
    } finally {
      setIsReplying(false);
    }
  };

  // Pin a comment
  const handlePinComment = async (commentId) => {
    if (!user) {
      alert("Please log in");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/free-videos/${id}/comment/${commentId}/pin`,
        {},
        { withCredentials: true }
      );

      // Update comment pin status
      setVideo(prev => {
        const updatedComments = prev.comments.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, pinned: res.data.pinned };
          } else if (res.data.pinned) {
            // If we're pinning a comment, make sure all others are unpinned
            return { ...comment, pinned: false };
          }
          return comment;
        });

        return {
          ...prev,
          comments: updatedComments
        };
      });
    } catch (err) {
      console.error("Error pinning comment:", err);
      if (err.response?.status === 403) {
        alert("Only the video creator can pin comments");
      } else {
        alert("Failed to pin comment. Please try again.");
      }
    }
  };

  // React to a comment
  const handleCommentReaction = async (commentId, reactionType) => {
    if (!user) {
      alert("Please log in to react to comments");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/free-videos/${id}/comment/${commentId}/react`,
        { type: reactionType },
        { withCredentials: true }
      );

      // Update comment reactions
      setVideo(prev => {
        const updatedComments = prev.comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              // Add these properties to track reaction counts and user's reaction
              likesCount: res.data.likes,
              dislikesCount: res.data.dislikes,
              userReaction: res.data.userReaction
            };
          }
          return comment;
        });

        return {
          ...prev,
          comments: updatedComments
        };
      });
    } catch (err) {
      console.error("Error reacting to comment:", err);
      alert("Failed to react to comment. Please try again.");
    }
  };

  // React to a reply
  const handleReplyReaction = async (commentId, replyId, reactionType) => {
    if (!user) {
      alert("Please log in to react to replies");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/free-videos/${id}/comment/${commentId}/reply/${replyId}/react`,
        { type: reactionType },
        { withCredentials: true }
      );

      // Update reply reactions
      setVideo(prev => {
        const updatedComments = prev.comments.map(comment => {
          if (comment._id === commentId) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply._id === replyId) {
                return {
                  ...reply,
                  // Add these properties to track reaction counts and user's reaction
                  likesCount: res.data.likes,
                  dislikesCount: res.data.dislikes,
                  userReaction: res.data.userReaction
                };
              }
              return reply;
            });

            return {
              ...comment,
              replies: updatedReplies
            };
          }
          return comment;
        });

        return {
          ...prev,
          comments: updatedComments
        };
      });
    } catch (err) {
      console.error("Error reacting to reply:", err);
      alert("Failed to react to reply. Please try again.");
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      alert("Please log in");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/free-videos/${id}/comment/${commentId}`,
        { withCredentials: true }
      );

      // Remove comment from UI
      setVideo(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId)
      }));
    } catch (err) {
      console.error("Error deleting comment:", err);
      if (err.response?.status === 403) {
        alert("You can only delete your own comments");
      } else {
        alert("Failed to delete comment. Please try again.");
      }
    }
  };

  // Delete a reply
  const handleDeleteReply = async (commentId, replyId) => {
    if (!user) {
      alert("Please log in");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/free-videos/${id}/comment/${commentId}/reply/${replyId}`,
        { withCredentials: true }
      );

      // Remove reply from UI
      setVideo(prev => {
        const updatedComments = prev.comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply._id !== replyId)
            };
          }
          return comment;
        });

        return {
          ...prev,
          comments: updatedComments
        };
      });
    } catch (err) {
      console.error("Error deleting reply:", err);
      if (err.response?.status === 403) {
        alert("You can only delete your own replies");
      } else {
        alert("Failed to delete reply. Please try again.");
      }
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "unknown time";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
  };

  // Get sorted comments (pinned first, then by date)
  const sortedComments = video?.comments ?
    [...video.comments].sort((a, b) => {
      // Pinned comments first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    }) : [];

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!video) {
    return <div className="text-center py-10">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="lg:w-2/3 ">
            {/* Video player */}
            <div className="mb-4">
              <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full h-96 rounded-lg"
                controls
                autoPlay
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
              />
            </div>

            {/* Video info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{video.title}</h1>
              <div className="flex items-center text-gray-400 mt-1">
                <span>{video.views} views</span>
                <span className="mx-2">•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>

              {/* Channel info and subscribe */}
              <div className="flex items-center justify-between mt-4 pb-4 border-b border-gray-800">
                <Link to={`/channel/${video.uploaderId}`} className="flex items-center">
                  {uploaderInfo && uploaderInfo.profileImageUrl ? (
                    <img
                      src={uploaderInfo.profileImageUrl.startsWith('http') ? uploaderInfo.profileImageUrl : `${API_URL}${uploaderInfo.profileImageUrl}`}
                      alt={video.uploader}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.uploader)}&background=random`;
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      {video.uploader ? video.uploader.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{video.uploader}</p>
                  </div>
                </Link>

                <ChannelSubscribe
                  channelId={video.uploaderId}
                  channelName={video.uploader}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center mt-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className="flex items-center space-x-1"
                    disabled={isLikeLoading}
                  >
                    {hasLiked ? (
                      <FaThumbsUp className="text-blue-500" />
                    ) : (
                      <FaRegThumbsUp />
                    )}
                    <span>{likeCount}</span>
                  </button>

                  <button
                    onClick={handleDislike}
                    className="flex items-center space-x-1"
                    disabled={isLikeLoading}
                  >
                    {hasDisliked ? (
                      <FaThumbsDown className="text-blue-500" />
                    ) : (
                      <FaRegThumbsDown />
                    )}
                    <span>{dislikeCount}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1"
                  >
                    <FaShare />
                    <span>Share</span>
                  </button>

                  <a
                    href={video.videoUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={handleWatchLater}
                    className="flex items-center space-x-1"
                    disabled={isWatchLaterLoading}
                  >
                    <FaClock className={inWatchLater ? "text-blue-500" : ""} />
                    <span>{inWatchLater ? "Added to Watch Later" : "Watch Later"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments section */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">
                {video.comments?.length || 0} Comments
              </h3>

              {/* Add comment */}
              {user ? (
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 bg-gray-800 rounded-lg min-h-[80px]"
                      ></textarea>

                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => setCommentText("")}
                          className="px-4 py-2 mr-2 text-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddComment}
                          disabled={isCommenting || !commentText.trim()}
                          className={`px-4 py-2 bg-blue-600 rounded-lg ${isCommenting || !commentText.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                            }`}
                        >
                          {isCommenting ? "Adding..." : "Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                  <p>
                    Please <Link to="/login" className="text-blue-400 hover:underline">log in</Link> to comment on this video.
                  </p>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-6">
                {sortedComments.length > 0 ? (
                  sortedComments.map((comment) => (
                    <div
                      key={comment._id}
                      className={`border-l-4 ${comment.pinned ? 'border-blue-500' : 'border-transparent'} pl-3`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${comment.isCreator ? 'bg-red-600' : 'bg-gray-600'
                          }`}>
                          {comment.username ? comment.username.charAt(0).toUpperCase() : "U"}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">{comment.username}</span>

                            {comment.isCreator && (
                              <span className="ml-2 text-xs bg-red-600 px-2 py-0.5 rounded-full">
                                Creator
                              </span>
                            )}

                            {comment.pinned && (
                              <span className="ml-2 text-xs text-blue-400 flex items-center">
                                <FaBell size={10} className="mr-1" /> Pinned
                              </span>
                            )}

                            <span className="ml-2 text-xs text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>

                          <p className="mt-1">{comment.text}</p>

                          {/* Comment actions */}
                          <div className="flex items-center mt-2 text-sm text-gray-400">
                            <button
                              onClick={() => handleCommentReaction(comment._id, 'like')}
                              className={`flex items-center mr-3 ${comment.userReaction === 'like' ? 'text-blue-500' : ''
                                }`}
                              disabled={!user}
                            >
                              <FaThumbsUp size={14} className="mr-1" />
                              <span>{comment.likesCount || 0}</span>
                            </button>

                            <button
                              onClick={() => handleCommentReaction(comment._id, 'dislike')}
                              className={`flex items-center mr-3 ${comment.userReaction === 'dislike' ? 'text-blue-500' : ''
                                }`}
                              disabled={!user}
                            >
                              <FaThumbsDown size={14} className="mr-1" />
                              <span>{comment.dislikesCount || 0}</span>
                            </button>

                            <button
                              onClick={() => setReplyingTo(comment)}
                              className="flex items-center mr-3"
                              disabled={!user}
                            >
                              <FaReply size={14} className="mr-1" />
                              <span>Reply</span>
                            </button>

                            {/* Comment management buttons (pin/delete) */}
                            {user && (user._id === video.uploaderId || user._id === comment.userId) && (
                              <div className="ml-auto relative group">
                                <button className="p-1">
                                  <FaEllipsisV size={14} />
                                </button>

                                <div className="hidden group-hover:block absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-lg z-10">
                                  {user._id === video.uploaderId && (
                                    <button
                                      onClick={() => handlePinComment(comment._id)}
                                      className="block w-full text-left p-2 hover:bg-gray-700"
                                    >
                                      {comment.pinned ? 'Unpin' : 'Pin comment'}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="block w-full text-left p-2 hover:bg-gray-700 text-red-400"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Reply form */}
                          {replyingTo && replyingTo._id === comment._id && (
                            <div className="mt-3 bg-gray-800 p-3 rounded-lg">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Replying to ${comment.username}...`}
                                className="w-full p-2 bg-gray-700 rounded-lg"
                              ></textarea>

                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText("");
                                  }}
                                  className="px-3 py-1 mr-2 text-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleAddReply}
                                  disabled={isReplying || !replyText.trim()}
                                  className={`px-3 py-1 bg-blue-600 rounded-lg ${isReplying || !replyText.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                                    }`}
                                >
                                  {isReplying ? "Replying..." : "Reply"}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-1 mt-3 pl-3 border-l border-gray-700 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply._id} className="mt-2">
                                  <div className="flex gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${reply.isCreator ? 'bg-red-600' : 'bg-gray-600'
                                      }`}>
                                      {reply.username ? reply.username.charAt(0).toUpperCase() : "U"}
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <span className="font-medium text-sm">{reply.username}</span>

                                        {reply.isCreator && (
                                          <span className="ml-2 text-xs bg-red-600 px-1.5 py-0.5 rounded-full">
                                            Creator
                                          </span>
                                        )}

                                        <span className="ml-2 text-xs text-gray-400">
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>

                                      <p className="mt-1 text-sm">{reply.text}</p>

                                      {/* Reply actions */}
                                      <div className="flex items-center mt-1 text-xs text-gray-400">
                                        <button
                                          onClick={() => handleReplyReaction(comment._id, reply._id, 'like')}
                                          className={`flex items-center mr-3 ${reply.userReaction === 'like' ? 'text-blue-500' : ''
                                            }`}
                                          disabled={!user}
                                        >
                                          <FaThumbsUp size={12} className="mr-1" />
                                          <span>{reply.likesCount || 0}</span>
                                        </button>

                                        <button
                                          onClick={() => handleReplyReaction(comment._id, reply._id, 'dislike')}
                                          className={`flex items-center mr-3 ${reply.userReaction === 'dislike' ? 'text-blue-500' : ''
                                            }`}
                                          disabled={!user}
                                        >
                                          <FaThumbsDown size={12} className="mr-1" />
                                          <span>{reply.dislikesCount || 0}</span>
                                        </button>

                                        {user && (
                                          user._id === video.uploaderId ||
                                          user._id === comment.userId ||
                                          user._id === reply.userId
                                        ) && (
                                            <button
                                              onClick={() => handleDeleteReply(comment._id, reply._id)}
                                              className="ml-auto text-red-400"
                                            >
                                              <FaTrash size={12} />
                                            </button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="flex-1 p-2 bg-gray-800 rounded-l-lg"
                />
                <button
                  type="submit"
                  className="bg-gray-700 px-4 py-2 rounded-r-lg"
                  disabled={isSearching}
                >
                  {isSearching ? "..." : <FaSearch />}
                </button>
              </form>
            </div>

            {/* Suggested videos */}
            <h3 className="text-xl font-semibold mb-3">Recommended Videos</h3>

            <div className="space-y-4">
              {suggestedVideos.length > 0 ? (
                suggestedVideos.map((video) => (
                  <Link
                    key={video._id}
                    to={`/watch/${video._id}`}
                    className="flex  rounded-lg overflow-hidden hover:bg-gray-800"
                  >
                    <div className="w-2/5">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-28 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="w-3/5 p-3">
                      <h4 className="font-medium line-clamp-2">{video.title}</h4>
                      <Link
                        to={`/channel/${video.uploaderId}`}
                        className="text-sm text-gray-400 mt-1 hover:text-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {video.uploader}
                      </Link>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{video.views} views</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No videos found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;