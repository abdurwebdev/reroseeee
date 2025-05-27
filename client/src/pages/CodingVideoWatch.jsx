import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaThumbsUp, FaThumbsDown, FaCode, FaLink, FaGithub, FaBook, FaTools, FaExternalLinkAlt, FaRegClock, FaEye, FaCalendarAlt, FaChevronDown, FaChevronUp, FaShare, FaDownload, FaListAlt, FaRegBookmark, FaBookmark, FaFlag, FaRegComment, FaSortAmountDown, FaUserCircle } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import getProfileImage from '../utils/getProfileImage';

const CodingVideoWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const commentInputRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showCodeSnippet, setShowCodeSnippet] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userAction, setUserAction] = useState('none'); // 'liked', 'disliked', or 'none'
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [commentSort, setCommentSort] = useState('newest');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    // First check localStorage for user data (this is how the main app stores login state)
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      console.log('User found in localStorage:', storedUser);
      setIsLoggedIn(true);
      setUser(storedUser);
    } else {
      // Fallback to API check if localStorage doesn't have user data
      const checkLoginStatus = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/users/me', {
            withCredentials: true
          });

          if (response.data.success) {
            console.log('User found via API:', response.data.data);
            setIsLoggedIn(true);
            setUser(response.data.data);
          }
        } catch (error) {
          console.log('User not logged in');
          setIsLoggedIn(false);
        }
      };

      checkLoginStatus();
    }
  }, []);

  // Fetch video data on component mount
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `http://localhost:5000/api/coding-videos/${id}`,
          {
            withCredentials: true,
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            }
          }
        );

        setVideo(response.data.data);

        // Check if user has liked or disliked the video
        if (isLoggedIn && user) {
          console.log('Checking if user has liked/disliked video:', user._id);
          console.log('Video likes:', response.data.data.likes);
          console.log('Video dislikes:', response.data.data.dislikes);

          const hasLiked = response.data.data.likes.includes(user._id);
          const hasDisliked = response.data.data.dislikes.includes(user._id);

          if (hasLiked) {
            console.log('User has liked this video');
            setUserAction('liked');
          } else if (hasDisliked) {
            console.log('User has disliked this video');
            setUserAction('disliked');
          }
        }
      } catch (error) {
        console.error('Error fetching coding video:', error);
        setError('Failed to load video. Please try again later.');
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, isLoggedIn, user]);

  // Fetch related videos
  useEffect(() => {
    const fetchRelatedVideos = async () => {
      if (!video) return;

      try {
        // Get videos with similar programming languages
        const params = new URLSearchParams();
        if (video.programmingLanguages && video.programmingLanguages.length > 0) {
          params.append('language', video.programmingLanguages[0]);
        }
        params.append('limit', 5);

        // Get token from localStorage
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `http://localhost:5000/api/coding-videos/feed?${params.toString()}`,
          {
            withCredentials: true,
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            }
          }
        );

        // Filter out the current video
        const filteredVideos = response.data.data.filter(v => v._id !== id);
        setRelatedVideos(filteredVideos.slice(0, 4));
      } catch (error) {
        console.error('Error fetching related videos:', error);
      }
    };

    fetchRelatedVideos();
  }, [video, id]);

  // Check if user is subscribed to the channel
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!isLoggedIn || !user || !video || !video.uploaderId) return;

      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `http://localhost:5000/api/subscriptions/check/${video.uploaderId._id}`,
          {
            withCredentials: true,
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            }
          }
        );

        if (response.data.success) {
          setIsSubscribed(response.data.isSubscribed);

          // Update subscriber count if it's different
          if (response.data.subscriberCount !== video.uploaderId.subscriberCount) {
            setVideo(prev => ({
              ...prev,
              uploaderId: {
                ...prev.uploaderId,
                subscriberCount: response.data.subscriberCount
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };

    checkSubscriptionStatus();
  }, [isLoggedIn, user, video]);

  // Jump to code snippet timestamp
  const jumpToTimestamp = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  // Handle like button click
  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to like videos');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `http://localhost:5000/api/coding-videos/${id}/like`,
        {},
        {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        }
      );

      setUserAction(response.data.data.userAction);

      // Update video likes/dislikes count
      setVideo(prev => ({
        ...prev,
        likes: Array(response.data.data.likes).fill(null),
        dislikes: Array(response.data.data.dislikes).fill(null)
      }));

      if (response.data.data.userAction === 'liked') {
        toast.success('Video liked!');
      }
    } catch (error) {
      console.error('Error liking video:', error);
      toast.error('Failed to like video');
    }
  };

  // Handle dislike button click
  const handleDislike = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to dislike videos');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `http://localhost:5000/api/coding-videos/${id}/dislike`,
        {},
        {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        }
      );

      setUserAction(response.data.data.userAction);

      // Update video likes/dislikes count
      setVideo(prev => ({
        ...prev,
        likes: Array(response.data.data.likes).fill(null),
        dislikes: Array(response.data.data.dislikes).fill(null)
      }));

      if (response.data.data.userAction === 'disliked') {
        toast.success('Video disliked');
      }
    } catch (error) {
      console.error('Error disliking video:', error);
      toast.error('Failed to dislike video');
    }
  };

  // Handle subscribe button click
  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to subscribe to channels');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (isSubscribed) {
        // Unsubscribe
        const response = await axios.post(
          'http://localhost:5000/api/subscriptions/unsubscribe',
          { channelId: video.uploaderId._id },
          {
            withCredentials: true,
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            }
          }
        );

        if (response.data.success) {
          setIsSubscribed(false);

          // Update the video object with the new subscriber count
          setVideo(prev => ({
            ...prev,
            uploaderId: {
              ...prev.uploaderId,
              subscriberCount: response.data.subscriberCount
            }
          }));

          toast.success('Unsubscribed from channel');
        }
      } else {
        // Subscribe
        const response = await axios.post(
          'http://localhost:5000/api/subscriptions/subscribe',
          { channelId: video.uploaderId._id },
          {
            withCredentials: true,
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            }
          }
        );

        if (response.data.success) {
          setIsSubscribed(true);

          // Update the video object with the new subscriber count
          setVideo(prev => ({
            ...prev,
            uploaderId: {
              ...prev.uploaderId,
              subscriberCount: response.data.subscriberCount
            }
          }));

          toast.success('Subscribed to channel!');
        }
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  // Handle bookmark button click
  const handleBookmark = () => {
    if (!isLoggedIn) {
      toast.info('Please log in to bookmark videos');
      return;
    }

    // Toggle bookmark status (in a real app, this would call an API)
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks!');
  };

  // Handle share button click
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  // Handle download button click
  const handleDownloadAndSave = () => {
    if (!video) return;
    // Download the video file (trigger browser download)
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = video.title ? `${video.title}.mp4` : 'coding-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save metadata to localStorage for Downloads page
    const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    // Avoid duplicates by id
    if (!downloads.some(d => d.id === video._id)) {
      downloads.push({
        id: video._id,
        title: video.title,
        videoUrl: video.videoUrl,
        channel: video.uploader || video.uploaderName || 'Unknown',
        thumbnail: video.thumbnailUrl || '',
        date: new Date().toISOString()
      });
      localStorage.setItem('downloads', JSON.stringify(downloads));
    }
  };

  // Handle add to playlist button click
  const handleAddToPlaylist = () => {
    if (!isLoggedIn) {
      toast.info('Please log in to add videos to playlists');
      return;
    }

    toast.info('Playlist feature coming soon!');
  };

  // Handle report button click
  const handleReport = () => {
    if (!isLoggedIn) {
      toast.info('Please log in to report videos');
      return;
    }

    toast.info('Report feature coming soon!');
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.info('Please log in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmittingComment(true);

      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `http://localhost:5000/api/coding-videos/${id}/comments`,
        { text: commentText },
        {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        }
      );

      // Update video with new comment
      setVideo(prev => ({
        ...prev,
        comments: [response.data.data, ...prev.comments]
      }));

      setCommentText('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get color for difficulty level
  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-600';
      case 'intermediate':
        return 'bg-blue-600';
      case 'advanced':
        return 'bg-purple-600';
      case 'expert':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Get icon for resource type
  const getResourceIcon = (type) => {
    switch (type) {
      case 'documentation':
        return <FaBook className="mr-2" />;
      case 'github':
        return <FaGithub className="mr-2" />;
      case 'article':
        return <FaLink className="mr-2" />;
      case 'tool':
        return <FaTools className="mr-2" />;
      default:
        return <FaLink className="mr-2" />;
    }
  };

  // Format comment date
  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes < 1 ? 'just now' : `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      return `${Math.floor(diffDays / 365)} years ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg">
            {error || 'Video not found'}
          </div>
          <Link
            to="/coding-videos"
            className="inline-block mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Coding Videos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                src={video.videoUrl}
                controls
                className="w-full h-auto"
                poster={video.thumbnailUrl}
              ></video>
            </div>

            {/* Video Title and Actions */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>

              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center text-gray-400 mb-2">
                  <div className="flex items-center mr-4">
                    <FaEye className="mr-1" />
                    <span>{video.views} views</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <FaRegClock className="mr-1" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className={`flex items-center px-3 py-1 rounded-lg ${userAction === 'liked' ? 'bg-gray-700 text-green-400' : 'hover:bg-gray-800 hover:text-green-400'}`}
                    onClick={handleLike}
                  >
                    <FaThumbsUp className="mr-1" />
                    <span>{video.likes?.length || 0}</span>
                  </button>

                  <button
                    className={`flex items-center px-3 py-1 rounded-lg ${userAction === 'disliked' ? 'bg-gray-700 text-red-400' : 'hover:bg-gray-800 hover:text-red-400'}`}
                    onClick={handleDislike}
                  >
                    <FaThumbsDown className="mr-1" />
                    <span>{video.dislikes?.length || 0}</span>
                  </button>

                  <button
                    className="flex items-center px-3 py-1 rounded-lg hover:bg-gray-800"
                    onClick={handleShare}
                  >
                    <FaShare className="mr-1" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={handleDownloadAndSave}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <FaDownload className="mr-2" />
                    Download Video
                  </button>

                  <button
                    className={`flex items-center px-3 py-1 rounded-lg ${isBookmarked ? 'bg-gray-700 text-blue-400' : 'hover:bg-gray-800'}`}
                    onClick={handleBookmark}
                  >
                    {isBookmarked ? <FaBookmark className="mr-1" /> : <FaRegBookmark className="mr-1" />}
                    <span>Save</span>
                  </button>

                  <button
                    className="flex items-center px-3 py-1 rounded-lg hover:bg-gray-800"
                    onClick={handleAddToPlaylist}
                  >
                    <FaListAlt className="mr-1" />
                    <span>Playlist</span>
                  </button>

                  <button
                    className="flex items-center px-3 py-1 rounded-lg hover:bg-gray-800"
                    onClick={handleReport}
                  >
                    <FaFlag className="mr-1" />
                    <span>Report</span>
                  </button>
                </div>
              </div>

              {/* Share options */}
              {showShareOptions && (
                <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Share this video</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700" onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                      setShowShareOptions(false);
                    }}>
                      Copy link
                    </button>
                    <button className="px-3 py-1 bg-blue-800 rounded-lg hover:bg-blue-900" onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                    }}>
                      Facebook
                    </button>
                    <button className="px-3 py-1 bg-blue-400 rounded-lg hover:bg-blue-500" onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(video.title)}`, '_blank');
                    }}>
                      Twitter
                    </button>
                    <button className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700" onClick={() => {
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(video.title + ' ' + window.location.href)}`, '_blank');
                    }}>
                      WhatsApp
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(video.difficultyLevel)}`}>
                  {video.difficultyLevel.charAt(0).toUpperCase() + video.difficultyLevel.slice(1)}
                </span>

                {video.programmingLanguages.map(lang => (
                  <span key={lang} className="px-3 py-1 bg-gray-700 rounded-full text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Uploader Info */}
            <div className="flex items-center mb-6 p-4 bg-gray-800 rounded-lg">
              {video.uploaderId?.profileImageUrl ? (
                <img
                  src={video.uploaderId.profileImageUrl}
                  alt={video.uploader}
                  className="w-12 h-12 rounded-full mr-4"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4">
                  <span className="text-xl font-bold">{video.uploader.charAt(0)}</span>
                </div>
              )}

              <div>
                <h3 className="font-semibold">{video.uploader}</h3>
                <p className="text-sm text-gray-400">
                  {video.uploaderId?.subscriberCount || 0} subscribers
                </p>
              </div>

              <button
                className={`ml-auto px-4 py-2 ${isSubscribed ? 'bg-gray-700 text-white' : 'bg-red-600 hover:bg-red-700'} rounded-lg transition-colors`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-700">
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'description' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'code' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('code')}
                >
                  Code Snippets ({video.codeSnippets?.length || 0})
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'resources' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('resources')}
                >
                  Resources ({video.resources?.length || 0})
                </button>
              </div>

              <div className="p-4">
                {activeTab === 'description' && (
                  <div>
                    <p className="whitespace-pre-line">{video.description}</p>

                    {(video.learningOutcomes?.length > 0 || video.prerequisites?.length > 0) && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {video.learningOutcomes?.length > 0 && (
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {video.learningOutcomes.map((outcome, index) => (
                                <li key={index} className="text-gray-300">{outcome}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {video.prerequisites?.length > 0 && (
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Prerequisites</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {video.prerequisites.map((prereq, index) => (
                                <li key={index} className="text-gray-300">{prereq}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FaRegComment className="mr-2" />
                          Comments ({video.comments?.length || 0})
                        </h3>
                        <button
                          onClick={() => setShowComments(!showComments)}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          {showComments ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      {showComments && (
                        <>
                          {/* Comment Form */}
                          <form onSubmit={handleCommentSubmit} className="mb-6">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                {isLoggedIn && user?.profileImageUrl ? (
                                  <img
                                    src={user.profileImageUrl}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <FaUserCircle className="w-10 h-10 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <textarea
                                  ref={commentInputRef}
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  placeholder={isLoggedIn ? "Add a comment..." : "Log in to comment"}
                                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                  rows="2"
                                  disabled={!isLoggedIn || submittingComment}
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                  <button
                                    type="button"
                                    onClick={() => setCommentText('')}
                                    className="px-3 py-1 mr-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={!isLoggedIn || !commentText.trim() || submittingComment}
                                    className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                  >
                                    {submittingComment ? 'Posting...' : 'Comment'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>

                          {/* Comment Sort */}
                          <div className="flex items-center mb-4">
                            <div className="flex items-center text-sm">
                              <FaSortAmountDown className="mr-2 text-gray-400" />
                              <span className="mr-2">Sort by:</span>
                              <select
                                value={commentSort}
                                onChange={(e) => setCommentSort(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded p-1"
                              >
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="popular">Top comments</option>
                              </select>
                            </div>
                          </div>

                          {/* Comments List */}
                          {video.comments && video.comments.length > 0 ? (
                            <div className="space-y-6">
                              {video.comments
                                .sort((a, b) => {
                                  if (commentSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                                  if (commentSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                                  if (commentSort === 'popular') return (b.reactions?.length || 0) - (a.reactions?.length || 0);
                                  return 0;
                                })
                                .map((comment, index) => (
                                  <div key={index} className="flex gap-3">
                                    <div className="flex-shrink-0">
                                      {getProfileImage(comment, comment.username) ? (
                                        <img
                                          src={getProfileImage(comment, comment.username)}
                                          alt={comment.username}
                                          className="w-10 h-10 rounded-full"
                                          onError={e => e.target.src = "/default-avatar.png"}
                                        />
                                      ) : (
                                        <FaUserCircle className="w-10 h-10 text-gray-600" />
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <div className="flex items-center">
                                        <h4 className="font-medium mr-2">{comment.username}</h4>
                                        {comment.isCreator && (
                                          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">Creator</span>
                                        )}
                                        <span className="text-xs text-gray-400 ml-2">{formatCommentDate(comment.createdAt)}</span>
                                      </div>
                                      <p className="mt-1">{comment.text}</p>
                                      <div className="flex items-center mt-2 text-sm">
                                        <button className="flex items-center mr-4 hover:text-blue-400">
                                          <FaThumbsUp className="mr-1" />
                                          <span>{comment.reactions?.filter(r => r.type === 'like').length || 0}</span>
                                        </button>
                                        <button className="flex items-center mr-4 hover:text-blue-400">
                                          <FaThumbsDown className="mr-1" />
                                          <span>{comment.reactions?.filter(r => r.type === 'dislike').length || 0}</span>
                                        </button>
                                        <button className="text-gray-400 hover:text-white">
                                          Reply
                                        </button>
                                      </div>

                                      {/* Comment Replies */}
                                      {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 pl-4 border-l border-gray-700 space-y-4">
                                          {comment.replies.map((reply, replyIndex) => (
                                            <div key={replyIndex} className="flex gap-3">
                                              <div className="flex-shrink-0">
                                                {getProfileImage(reply, reply.username) ? (
                                                  <img
                                                    src={getProfileImage(reply, reply.username)}
                                                    alt={reply.username}
                                                    className="w-8 h-8 rounded-full"
                                                    onError={e => e.target.src = "/default-avatar.png"}
                                                  />
                                                ) : (
                                                  <FaUserCircle className="w-8 h-8 text-gray-600" />
                                                )}
                                              </div>
                                              <div>
                                                <div className="flex items-center">
                                                  <h5 className="font-medium text-sm mr-2">{reply.username}</h5>
                                                  {reply.isCreator && (
                                                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">Creator</span>
                                                  )}
                                                  <span className="text-xs text-gray-400 ml-2">{formatCommentDate(reply.createdAt)}</span>
                                                </div>
                                                <p className="mt-1 text-sm">{reply.text}</p>
                                                <div className="flex items-center mt-1 text-xs">
                                                  <button className="flex items-center mr-3 hover:text-blue-400">
                                                    <FaThumbsUp className="mr-1" />
                                                    <span>{reply.reactions?.filter(r => r.type === 'like').length || 0}</span>
                                                  </button>
                                                  <button className="flex items-center hover:text-blue-400">
                                                    <FaThumbsDown className="mr-1" />
                                                    <span>{reply.reactions?.filter(r => r.type === 'dislike').length || 0}</span>
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div>
                    {video.codeSnippets?.length > 0 ? (
                      <div className="space-y-4">
                        {video.codeSnippets.map((snippet, index) => (
                          <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                            <div
                              className="flex justify-between items-center p-3 bg-gray-700 cursor-pointer"
                              onClick={() => setShowCodeSnippet(showCodeSnippet === index ? null : index)}
                            >
                              <div>
                                <span className="font-mono text-green-400 mr-2">{snippet.language}</span>
                                <span className="text-sm">{snippet.description}</span>
                              </div>
                              <div className="flex items-center">
                                {snippet.startTime && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      jumpToTimestamp(snippet.startTime);
                                    }}
                                    className="px-2 py-1 bg-blue-600 rounded text-xs mr-2 hover:bg-blue-700"
                                  >
                                    Jump to {formatDuration(snippet.startTime)}
                                  </button>
                                )}
                                {showCodeSnippet === index ? <FaChevronUp /> : <FaChevronDown />}
                              </div>
                            </div>

                            {showCodeSnippet === index && (
                              <pre className="p-4 overflow-x-auto bg-gray-900 text-gray-300 font-mono text-sm">
                                <code>{snippet.code}</code>
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No code snippets available for this video.</p>
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div>
                    {video.resources?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {video.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            {getResourceIcon(resource.type)}
                            <div className="flex-grow">
                              <h4 className="font-medium">{resource.title}</h4>
                              <p className="text-xs text-gray-400 truncate">{resource.url}</p>
                            </div>
                            <FaExternalLinkAlt className="text-gray-400" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No additional resources available for this video.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Related Videos</h3>

            <div className="space-y-4">
              {relatedVideos.length > 0 ? (
                relatedVideos.map(video => (
                  <Link
                    key={video._id}
                    to={`/coding-videos/${video._id}`}
                    className="flex gap-2 hover:bg-gray-800 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 relative w-40 h-24">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 px-1 py-0.5 rounded text-xs">
                        {formatDuration(video.duration)}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{video.uploader}</p>
                      <p className="text-xs text-gray-400 mt-1">{video.views} views</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No related videos found.
                </p>
              )}
            </div>

            {/* YouTube-like Autoplay Toggle */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Autoplay</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      name="autoplay"
                      id="autoplay"
                      className="sr-only"
                      checked={true}
                      onChange={() => toast.info('Autoplay toggle feature coming soon!')}
                    />
                    <label
                      htmlFor="autoplay"
                      className={`block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-red-600 transform transition-transform duration-200 ease-in translate-x-4`}
                      ></span>
                    </label>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Up next
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CodingVideoWatch;
