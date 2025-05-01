import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaThumbsUp, FaComment, FaEdit, FaTrash, FaFilter, FaSort } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Spinner from '../Spinner';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudioContent = () => {
  const [user] = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    type: 'all',
    sort: 'newest',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/studio/content`, {
          params: {
            type: filters.type,
            sort: filters.sort,
            page: filters.page,
            limit: 10
          },
          withCredentials: true
        });
        
        if (response.data.success) {
          setVideos(response.data.data.videos);
          setPagination(response.data.data.pagination);
        } else {
          showErrorToast('Failed to load content');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        showErrorToast(error.response?.data?.message || 'Error loading content');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchContent();
    }
  }, [user, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page when changing filters
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setFilters({
      ...filters,
      page: newPage
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  if (loading && filters.page === 1) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content</h1>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded flex items-center"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
          
          <Link
            to="/upload-video"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Upload Video
          </Link>
          
          <Link
            to="/upload-short"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Upload Short
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Content Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Content</option>
                <option value="video">Videos</option>
                <option value="short">Shorts</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Sort By</label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Date (Newest)</option>
                <option value="oldest">Date (Oldest)</option>
                <option value="most-viewed">Most Views</option>
                <option value="least-viewed">Least Views</option>
                <option value="most-liked">Most Likes</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-4 py-3 text-left">Video</th>
              <th className="px-4 py-3 text-center">Type</th>
              <th className="px-4 py-3 text-right">Views</th>
              <th className="px-4 py-3 text-right">Likes</th>
              <th className="px-4 py-3 text-right">Comments</th>
              <th className="px-4 py-3 text-right">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length > 0 ? (
              videos.map((video) => (
                <tr key={video._id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-20 h-12 object-cover rounded mr-3"
                      />
                      <div>
                        <h3 className="font-medium truncate max-w-xs">{video.title}</h3>
                        <Link 
                          to={`/watch/${video._id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                          target="_blank"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      video.type === 'video' ? 'bg-blue-900 text-blue-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {video.type === 'video' ? 'Video' : 'Short'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <FaEye className="mr-1 text-gray-400" />
                      {formatNumber(video.views)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <FaThumbsUp className="mr-1 text-gray-400" />
                      {formatNumber(video.likes?.length || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <FaComment className="mr-1 text-gray-400" />
                      {formatNumber(video.comments?.length || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatDate(video.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="text-blue-400 hover:text-blue-300"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                  {loading ? 'Loading content...' : 'No content found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-gray-400">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to {
              Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)
            } of {pagination.totalItems} items
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === 1
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>
            
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === pagination.totalPages
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioContent;
