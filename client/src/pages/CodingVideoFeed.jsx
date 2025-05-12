import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCode, FaFilter, FaSortAmountDown, FaSearch, FaLaptopCode, FaFire, FaRegClock, FaThumbsUp, FaEye, FaCalendarAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const programmingLanguageOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go',
  'Rust', 'PHP', 'Ruby', 'Swift'
];

const difficultyLevels = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' }
];

const CodingVideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [latestVideos, setLatestVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    language: '',
    difficulty: '',
    sort: 'newest',
    search: ''
  });

  // Fetch trending videos on component mount
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5000/api/coding-videos/trending?limit=6', {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        setTrendingVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching trending videos:', error);
      }
    };

    fetchTrendingVideos();
  }, []);

  // Fetch recommended videos on component mount
  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem("user"));

        console.log('User from localStorage:', storedUser);
        console.log('Token from localStorage:', token);

        const response = await axios.get('http://localhost:5000/api/coding-videos/recommended?limit=6', {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        setRecommendedVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching recommended videos:', error);
      }
    };

    fetchRecommendedVideos();
  }, []);

  // Fetch latest videos on component mount
  useEffect(() => {
    const fetchLatestVideos = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5000/api/coding-videos/latest?limit=6', {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        setLatestVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching latest videos:', error);
      }
    };

    fetchLatestVideos();
  }, []);

  // Fetch videos on component mount and when filters change
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 12);

        if (filters.language) {
          params.append('language', filters.language);
        }

        if (filters.difficulty) {
          params.append('difficulty', filters.difficulty);
        }

        if (filters.sort) {
          params.append('sort', filters.sort);
        }

        if (filters.search) {
          params.append('search', filters.search);
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');

        const response = await axios.get(`http://localhost:5000/api/coding-videos/feed?${params.toString()}`, {
          withCredentials: true,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });

        setVideos(response.data.data);
        setTotalPages(response.data.pagination.pages);
      } catch (error) {
        console.error('Error fetching coding videos:', error);
        setError('Failed to load coding videos. Please try again later.');
        toast.error('Failed to load coding videos');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'all') {
      fetchVideos();
    }
  }, [page, filters, activeTab]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Reusable video card component
  const renderVideoCard = (video) => (
    <Link
      key={video._id}
      to={`/coding-videos/${video._id}`}
      className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-200"
    >
      <div className="relative">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
          {formatDuration(video.duration)}
        </div>
        <div className="absolute top-2 right-2 bg-green-600 px-2 py-1 rounded text-xs font-semibold">
          {video.difficultyLevel}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{video.title}</h3>

        <div className="flex items-center text-sm text-gray-400 mb-2">
          <span>{video.uploader}</span>
          <span className="mx-1">•</span>
          <span>{video.views} views</span>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {video.programmingLanguages.slice(0, 3).map(lang => (
            <span
              key={lang}
              className="px-2 py-1 bg-gray-700 rounded-full text-xs"
            >
              {lang}
            </span>
          ))}
          {video.programmingLanguages.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">
              +{video.programmingLanguages.length - 3}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-400 mt-2">
          {formatDate(video.createdAt)}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <FaLaptopCode className="mr-3 text-green-500" />
            Coding Videos
          </h1>

          <div className="flex items-center mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-800 rounded-lg mr-3 hover:bg-gray-700 transition-colors"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>

            <Link
              to="/upload-coding-video"
              className="flex items-center px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaCode className="mr-2" />
              Upload Video
            </Link>
          </div>
        </div>

        {/* YouTube-like Tabs */}
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${activeTab === 'all' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('all')}
          >
            <FaLaptopCode className="mr-2" /> All Videos
          </button>
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${activeTab === 'trending' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('trending')}
          >
            <FaFire className="mr-2" /> Trending
          </button>
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${activeTab === 'recommended' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('recommended')}
          >
            <FaThumbsUp className="mr-2" /> Recommended
          </button>
          <button
            className={`px-4 py-2 flex items-center whitespace-nowrap ${activeTab === 'latest' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('latest')}
          >
            <FaRegClock className="mr-2" /> Latest
          </button>
        </div>

        {/* Search and Filters - Only show in "All Videos" tab */}
        {activeTab === 'all' && (
          <div className={`bg-gray-800 rounded-lg p-4 mb-8 ${showFilters ? 'block' : 'hidden'}`}>
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search coding videos..."
                  className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors"
                >
                  <FaSearch />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Programming Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Languages</option>
                  {programmingLanguageOptions.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <div className="flex items-center">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FaSortAmountDown className="ml-2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trending Videos Section */}
        {activeTab === 'trending' && (
          <div>
            <div className="flex items-center mb-4">
              <FaFire className="text-red-500 mr-2" />
              <h2 className="text-xl font-semibold">Trending Coding Videos</h2>
            </div>

            {trendingVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No trending videos available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingVideos.map(renderVideoCard)}
              </div>
            )}
          </div>
        )}

        {/* Recommended Videos Section */}
        {activeTab === 'recommended' && (
          <div>
            <div className="flex items-center mb-4">
              <FaThumbsUp className="text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Recommended For You</h2>
            </div>

            {recommendedVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No recommended videos available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedVideos.map(renderVideoCard)}
              </div>
            )}
          </div>
        )}

        {/* Latest Videos Section */}
        {activeTab === 'latest' && (
          <div>
            <div className="flex items-center mb-4">
              <FaRegClock className="text-green-500 mr-2" />
              <h2 className="text-xl font-semibold">Latest Uploads</h2>
            </div>

            {latestVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No latest videos available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {latestVideos.map(renderVideoCard)}
              </div>
            )}
          </div>
        )}

        {/* All Videos Grid */}
        {activeTab === 'all' && (
          loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg">
              {error}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <FaCode className="mx-auto text-5xl text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No coding videos found</h3>
              <p className="text-gray-400">Try adjusting your filters or be the first to upload a coding video!</p>
              <Link
                to="/upload-coding-video"
                className="inline-block mt-4 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload Video
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map(renderVideoCard)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <div className="flex items-center px-4 bg-gray-800 rounded-lg">
                      Page {page} of {totalPages}
                    </div>

                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CodingVideoFeed;
