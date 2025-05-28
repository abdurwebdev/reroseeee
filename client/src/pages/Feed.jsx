import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LivestreamList from "../components/LivestreamList";
import FeedSidebar from "../components/FeedSidebar";
import VoiceSearch from "../components/VoiceSearch";
import { FaSearch, FaFire, FaCode, FaVideo, FaFilm, FaLaptopCode, FaThumbsUp, FaRegClock } from "react-icons/fa";
import { toast } from "react-toastify";

// Helper function to format video duration
const formatDuration = (seconds) => {
  if (!seconds) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
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

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [activeLivestreams, setActiveLivestreams] = useState([]);
  const [endedLivestreams, setEndedLivestreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [subscriptions, setSubscriptions] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [canUploadCoding, setCanUploadCoding] = useState(false);

  // New state variables for coding videos
  const [recommendedCodingVideos, setRecommendedCodingVideos] = useState([]);
  const [trendingCodingVideos, setTrendingCodingVideos] = useState([]);
  const [codingShorts, setCodingShorts] = useState([]);
  const [loadingCodingVideos, setLoadingCodingVideos] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const fetchVideos = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/free-videos/feed`, {
          withCredentials: true,
        });
        const allVideos = res.data;
        setVideos(allVideos.filter((video) => video.type === "video"));
        setShorts(allVideos.filter((video) => video.type === "short"));

        // Set user videos if user is logged in
        if (storedUser) {
          setUserVideos(
            allVideos.filter((video) => video.uploader === storedUser.name)
          );
        }

        // Create trending videos based on view count
        const sortedByViews = [...allVideos].sort((a, b) => b.views - a.views).slice(0, 10);
        setTrendingVideos(sortedByViews);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch videos");
        setLoading(false);
      }
    };

    // Fetch active livestreams
    const fetchLivestreams = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/livestream/active`);
        setActiveLivestreams(res.data.data || []);

        // Also fetch ended livestreams
        const endedRes = await axios.get(`${API_URL}/api/livestream/ended`);
        setEndedLivestreams(endedRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch livestreams:", err);
        // Don't set the main error state, as we still want to show videos
      }
    };

    // Fetch user subscriptions if user is logged in
    const fetchSubscriptions = async () => {
      if (!storedUser) return;

      try {
        const res = await axios.get("http://localhost:5000/api/subscriptions/my-subscriptions", {
          withCredentials: true,
        });

        if (res.data.success) {
          setSubscriptions(res.data.subscriptions || []);
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      }
    };

    // Check if user can upload coding videos
    const checkUploadPermission = async () => {
      if (!storedUser) return;

      try {
        const res = await axios.get("http://localhost:5000/api/coding-videos/check-upload-permission", {
          withCredentials: true,
        });

        if (res.data.success) {
          setCanUploadCoding(res.data.canUpload);
        }
      } catch (err) {
        console.error("Failed to check upload permission:", err);
        setCanUploadCoding(false);
      }
    };

    // Fetch recommended coding videos
    const fetchRecommendedCodingVideos = async () => {
      try {
        setLoadingCodingVideos(true);
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5000/api/coding-videos/recommended?limit=8', {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        if (response.data.success) {
          // Filter to get only regular videos (not shorts)
          const regularVideos = response.data.data.filter(video => video.type === 'video');
          setRecommendedCodingVideos(regularVideos);
        }
      } catch (error) {
        console.error('Error fetching recommended coding videos:', error);
      }
    };

    // Fetch trending coding videos
    const fetchTrendingCodingVideos = async () => {
      try {
        const token = localStorage.getItem('token');

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${API_URL}/api/coding-videos/trending?limit=8`, {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        if (response.data.success) {
          // Filter to get only regular videos (not shorts)
          const regularVideos = response.data.data.filter(video => video.type === 'video');
          setTrendingCodingVideos(regularVideos);
        }
      } catch (error) {
        console.error('Error fetching trending coding videos:', error);
      }
    };

    // Fetch coding shorts
    const fetchCodingShorts = async () => {
      try {
        const token = localStorage.getItem('token');

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${API_URL}/api/coding-videos/feed?limit=12`, {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        if (response.data.success) {
          // Filter to get only shorts
          const shorts = response.data.data.filter(video => video.type === 'short');
          setCodingShorts(shorts);
        }

        setLoadingCodingVideos(false);
      } catch (error) {
        console.error('Error fetching coding shorts:', error);
        setLoadingCodingVideos(false);
      }
    };

    fetchVideos();
    fetchLivestreams();
    fetchSubscriptions();
    checkUploadPermission();
    fetchRecommendedCodingVideos();
    fetchTrendingCodingVideos();
    fetchCodingShorts();
  }, []);

  // Advanced filtering logic with ranking
  const filterVideos = (list) => {
    if (!searchTerm.trim()) return list;

    const query = searchTerm.toLowerCase();

    return list
      .filter(video => {
        // Check if title or uploader contains the search term
        const titleMatch = video.title.toLowerCase().includes(query);
        const uploaderMatch = video.uploader.toLowerCase().includes(query);
        return titleMatch || uploaderMatch;
      })
      .sort((a, b) => {
        // Rank exact matches higher
        const aExactMatch = a.title.toLowerCase() === query;
        const bExactMatch = b.title.toLowerCase() === query;

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // Then rank by view count
        return b.views - a.views;
      });
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Perform search
  const performSearch = () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    // If we want to implement server-side search in the future:
    // axios.get(`http://localhost:5000/api/free-videos/search?q=${searchTerm}`)
    //   .then(res => {
    //     // Process results
    //   })
    //   .catch(err => console.error("Search error:", err))
    //   .finally(() => setIsSearching(false));

    // For now, we'll just use client-side filtering
    setIsSearching(false);
  };

  // Handle voice search result
  const handleVoiceSearchResult = (transcript) => {
    setSearchTerm(transcript);
    performSearch();
  };

  // Reusable video card component for regular videos
  const renderVideoCard = (video) => (
    <Link
      to={`/watch/${video._id}`}
      key={video._id}
      className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="relative">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-md font-semibold text-gray-100 truncate">{video.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{video.uploader} • {video.views} views</p>
        {video.createdAt && (
          <p className="text-xs text-gray-500 mt-1">{formatDate(video.createdAt)}</p>
        )}
      </div>
    </Link>
  );

  // Reusable coding video card component with more details
  const renderCodingVideoCard = (video) => (
    <Link
      to={`/coding-videos/${video._id}`}
      key={video._id}
      className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="relative">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
            {formatDuration(video.duration)}
          </div>
        )}
        {video.difficultyLevel && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${video.difficultyLevel === 'beginner' ? 'bg-green-600' :
            video.difficultyLevel === 'intermediate' ? 'bg-yellow-600' :
              video.difficultyLevel === 'advanced' ? 'bg-orange-600' : 'bg-red-600'
            }`}>
            {video.difficultyLevel.charAt(0).toUpperCase() + video.difficultyLevel.slice(1)}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-md font-semibold text-gray-100 truncate">{video.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{video.uploader} • {video.views} views</p>

        {/* Programming languages */}
        {video.programmingLanguages && video.programmingLanguages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.programmingLanguages.slice(0, 3).map(lang => (
              <span key={lang} className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                {lang}
              </span>
            ))}
            {video.programmingLanguages.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                +{video.programmingLanguages.length - 3}
              </span>
            )}
          </div>
        )}

        {video.createdAt && (
          <p className="text-xs text-gray-500 mt-1">{formatDate(video.createdAt)}</p>
        )}
      </div>
    </Link>
  );

  // Reusable short video card component
  const renderShortCard = (short) => (
    <Link
      to={`/watch/${short._id}`}
      key={short._id}
      className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="relative pb-[177%]"> {/* Vertical aspect ratio for shorts */}
        <img
          src={short.thumbnailUrl.startsWith('http') ? short.thumbnailUrl : `http://localhost:5000${short.thumbnailUrl}`}
          alt={short.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-md font-semibold text-gray-100 truncate">{short.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{short.views} views</p>
      </div>
    </Link>
  );

  // Reusable coding short card component
  const renderCodingShortCard = (short) => (
    <Link
      to={`/coding-videos/${short._id}`}
      key={short._id}
      className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="relative pb-[177%]"> {/* Vertical aspect ratio for shorts */}
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {short.programmingLanguages && short.programmingLanguages.length > 0 && (
          <div className="absolute bottom-2 left-2 bg-blue-600 px-2 py-1 rounded text-xs font-semibold">
            {short.programmingLanguages[0]}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-md font-semibold text-gray-100 truncate">{short.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{short.views} views</p>
      </div>
    </Link>
  );

  if (loading) return <div className="text-center text-xl mt-10 text-gray-300">Loading...</div>;
  if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - hidden on mobile, shown on larger screens */}
        <div className="hidden md:block md:w-64 lg:w-72 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          <FeedSidebar user={user} subscriptions={subscriptions} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Search bar with voice search */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-full text-black bg-white outline-none border border-gray-300 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              <VoiceSearch onSearchResult={handleVoiceSearchResult} />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full"
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          {/* Upload buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              to="/live-course"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  toast.warning("Please log in to go live");
                  navigate("/login");
                }
              }}
            >
              <FaVideo className="mr-2" />
              Go Live
            </Link>

            {/* Coding video upload buttons - always show but redirect to verification if needed */}
            <Link
              to={user ? "/coder-verification" : "/login"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  toast.warning("Please log in to upload coding videos");
                  navigate("/login");
                }
              }}
            >
              <FaCode className="mr-2" />
              Upload Coding Video
            </Link>
            <Link
              to={user ? "/coder-verification" : "/login"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  toast.warning("Please log in to upload coding shorts");
                  navigate("/login");
                }
              }}
            >
              <FaCode className="mr-2" />
              Upload Coding Short
            </Link>
          </div>

          {/* Active Livestreams Section */}
          {activeLivestreams.length > 0 && (
            <LivestreamList
              livestreams={activeLivestreams}
              title="Live Now"
              emptyMessage="No active livestreams at the moment."
              linkTo="/watch-livestream"
            />
          )}

          {/* Recommended Coding Videos Section - Prominently displayed near the top */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaLaptopCode className="text-blue-500 mr-2 text-xl" />
                <h2 className="text-2xl font-semibold text-gray-100">Recommended Coding Videos</h2>
              </div>
              <Link
                to="/coding-videos"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                View All
              </Link>
            </div>

            {loadingCodingVideos ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : recommendedCodingVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendedCodingVideos.slice(0, 8).map(renderCodingVideoCard)}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#111111] rounded-lg">
                <FaCode className="mx-auto text-4xl text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professional Coding Tutorials</h3>
                <p className="text-gray-400 mb-4">Learn programming from verified professional coders</p>
                <Link
                  to="/coding-videos"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore Coding Videos
                </Link>
              </div>
            )}
          </div>

          {/* Coding Shorts Section */}
          {codingShorts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaCode className="text-blue-500 mr-2 text-xl" />
                  <h2 className="text-2xl font-semibold text-gray-100">Coding Shorts</h2>
                </div>
                <Link
                  to="/coding-videos?type=short"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {codingShorts.slice(0, 6).map(renderCodingShortCard)}
              </div>
            </div>
          )}

          {/* Trending Coding Videos Section */}
          {trendingCodingVideos.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaFire className="text-blue-500 mr-2 text-xl" />
                  <h2 className="text-2xl font-semibold text-gray-100">Trending in Coding</h2>
                </div>
                <Link
                  to="/coding-videos?sort=trending"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trendingCodingVideos.slice(0, 4).map(renderCodingVideoCard)}
              </div>
            </div>
          )}

          {/* Trending Videos Section */}
          {trendingVideos.length > 0 && searchTerm.trim() === "" && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FaFire className="text-red-500 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-100">Trending</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trendingVideos.slice(0, 8).map(renderVideoCard)}
              </div>
            </div>
          )}

          {/* User's Videos Section */}
          {user && filterVideos(userVideos).length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-100">Your Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filterVideos(userVideos).map((video) => (
                  <Link to={`/watch/${video._id}`} key={video._id} className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" />
                    <div className="p-3">
                      <h3 className="text-md font-semibold text-gray-100 truncate">{video.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{video.uploader} • {video.views} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}


          {/* Recent Ended Livestreams Section */}
          {endedLivestreams.length > 0 && (
            <LivestreamList
              livestreams={endedLivestreams}
              title="Recent Livestreams"
              emptyMessage="No recent livestreams available."
              linkTo="/watch-livestream"
            />
          )}




          {/* Monetization Information */}
          <div className="mt-12 p-6 bg-[#111111] rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Monetization Information</h2>
            <p className="text-gray-300 mb-3">
              The earnings generated through this platform represent real money. Creators can earn through:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Video views (based on watch time)</li>
              <li>Ad impressions and clicks</li>
              <li>Livestream views and donations</li>
            </ul>
            <p className="text-gray-300 mt-3">
              Payments are processed through JazzCash, Easypaisa, or PayFast for the Pakistani market.
              Visit the Creator Studio for more details on monetization eligibility and earnings.
            </p>
          </div>

          {/* Footer with YouTube-like links */}
          <div className="mt-12 py-6 border-t border-gray-800">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
              <Link to="/about" className="hover:text-gray-200">About</Link>
              <Link to="/press" className="hover:text-gray-200">Press</Link>
              <Link to="/copyright" className="hover:text-gray-200">Copyright</Link>
              <Link to="/contact" className="hover:text-gray-200">Contact us</Link>
              <Link to="/creators" className="hover:text-gray-200">Creators</Link>
              <Link to="/advertise" className="hover:text-gray-200">Advertise</Link>
              <Link to="/developers" className="hover:text-gray-200">Developers</Link>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mt-4">
              <Link to="/terms" className="hover:text-gray-200">Terms</Link>
              <Link to="/privacy" className="hover:text-gray-200">Privacy</Link>
              <Link to="/policy" className="hover:text-gray-200">Policy & Safety</Link>
              <Link to="/how-rerose-works" className="hover:text-gray-200">How Rerose works</Link>
              <Link to="/test-features" className="hover:text-gray-200">Test new features</Link>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              © 2025 Rerose Academy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
