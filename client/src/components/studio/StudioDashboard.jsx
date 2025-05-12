import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaUsers, FaClock, FaPlay, FaMoneyBillWave } from 'react-icons/fa';
import { showErrorToast } from '../../utils/toast';
import Spinner from '../Spinner';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudioDashboard = () => {
  const [user] = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/studio/overview`, { withCredentials: true });

        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError('Failed to load dashboard data');
          showErrorToast('Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Error loading dashboard data');
        showErrorToast(error.response?.data?.message || 'Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    if (hours >= 1000) {
      return (hours / 1000).toFixed(1) + 'K hours';
    }
    return hours + ' hours';
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Creator Studio Dashboard</h1>

      {/* Channel stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <FaEye className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Total Views</h3>
              <p className="text-2xl font-bold">{formatNumber(dashboardData?.analytics?.totalViews || 0)}</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Lifetime channel views
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600 p-3 rounded-full mr-4">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Subscribers</h3>
              <p className="text-2xl font-bold">{formatNumber(dashboardData?.analytics?.totalSubscribers || 0)}</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            {dashboardData?.monetization?.isEligible ?
              <span className="text-green-400">Eligible for monetization</span> :
              <span>Need {1000 - (dashboardData?.channel?.subscriberCount || 0)} more for monetization</span>
            }
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 p-3 rounded-full mr-4">
              <FaClock className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Watch Time</h3>
              <p className="text-2xl font-bold">{formatTime(dashboardData?.analytics?.totalWatchTimeMinutes || 0)}</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            {(dashboardData?.analytics?.totalWatchTimeMinutes || 0) >= 240000 ?
              <span className="text-green-400">Meets 4000 hour requirement</span> :
              <span>Need {formatTime(240000 - (dashboardData?.analytics?.totalWatchTimeMinutes || 0))} more</span>
            }
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 p-3 rounded-full mr-4">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Earnings (30 days)</h3>
              {dashboardData?.channel?.isMonetized &&
                (dashboardData?.channel?.subscriberCount >= 1000) &&
                ((dashboardData?.analytics?.totalWatchTimeMinutes >= 240000) ||
                  (dashboardData?.channel?.totalShortViews >= 10000000)) ? (
                <p className="text-2xl font-bold">{formatCurrency(dashboardData?.recentEarnings?.totalAmount || 0)}</p>
              ) : (
                <p className="text-2xl font-bold">--</p>
              )}
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            {dashboardData?.channel?.isMonetized ? (
              (dashboardData?.channel?.subscriberCount >= 1000) &&
                ((dashboardData?.analytics?.totalWatchTimeMinutes >= 240000) ||
                  (dashboardData?.channel?.totalShortViews >= 10000000)) ? (
                <span className="text-green-400">Channel is monetized</span>
              ) : (
                <span className="text-yellow-400">Meet requirements to view earnings</span>
              )
            ) : (
              <span>Not monetized yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Monetization status */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Monetization Status</h2>

        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-lg">
              Status:
              <span className={`ml-2 font-semibold ${dashboardData?.channel?.monetizationStatus === 'approved' ? 'text-green-400' :
                dashboardData?.channel?.monetizationStatus === 'under_review' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                {dashboardData?.channel?.monetizationStatus === 'approved' ? 'Approved' :
                  dashboardData?.channel?.monetizationStatus === 'under_review' ? 'Under Review' :
                    dashboardData?.channel?.monetizationStatus === 'rejected' ? 'Rejected' :
                      'Not Eligible'}
              </span>
            </p>

            {dashboardData?.monetization?.application && (
              <p className="text-gray-400 mt-1">
                Applied on: {formatDate(dashboardData.monetization.application.applicationDate)}
              </p>
            )}
          </div>

          <div>
            {!dashboardData?.channel?.isMonetized && dashboardData?.monetization?.isEligible &&
              dashboardData?.channel?.monetizationStatus === 'not_eligible' && (
                <Link
                  to="/studio/monetization"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Apply for Monetization
                </Link>
              )}

            {dashboardData?.channel?.isMonetized && (
              <Link
                to="/studio/monetization"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                View Earnings
              </Link>
            )}
          </div>
        </div>

        {/* Requirements progress */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Subscribers</span>
              <span className={`font-semibold ${(dashboardData?.channel?.subscriberCount || 0) >= 1000 ? 'text-green-400' : 'text-gray-400'}`}>
                {formatNumber(dashboardData?.channel?.subscriberCount || 0)}/1,000
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${(dashboardData?.channel?.subscriberCount || 0) >= 1000 ? 'bg-green-600' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, ((dashboardData?.channel?.subscriberCount || 0) / 1000) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Watch Hours</span>
              <span className={`font-semibold ${(dashboardData?.analytics?.totalWatchTimeMinutes || 0) >= 240000 ? 'text-green-400' : 'text-gray-400'}`}>
                {Math.floor((dashboardData?.analytics?.totalWatchTimeMinutes || 0) / 60)}/4,000
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${(dashboardData?.analytics?.totalWatchTimeMinutes || 0) >= 240000 ? 'bg-green-600' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, ((dashboardData?.analytics?.totalWatchTimeMinutes || 0) / 240000) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Short Views</span>
              <span className={`font-semibold ${(dashboardData?.channel?.totalShortViews || 0) >= 10000000 ? 'text-green-400' : 'text-gray-400'}`}>
                {formatNumber(dashboardData?.channel?.totalShortViews || 0)}/10M
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${(dashboardData?.channel?.totalShortViews || 0) >= 10000000 ? 'bg-green-600' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, ((dashboardData?.channel?.totalShortViews || 0) / 10000000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent videos */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Videos</h2>
            <Link to="/studio/content" className="text-blue-400 hover:text-blue-300 text-sm">
              View All
            </Link>
          </div>

          {dashboardData?.recentVideos?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentVideos.map((video) => (
                <div key={video._id} className="flex items-center">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium truncate">{video.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="flex items-center mr-3">
                        <FaEye className="mr-1" /> {formatNumber(video.views)}
                      </span>
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No videos uploaded yet</p>
          )}
        </div>

        {/* Recent livestreams */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Livestreams</h2>
            <Link to="/live-course" className="text-blue-400 hover:text-blue-300 text-sm">
              Go Live
            </Link>
          </div>

          {dashboardData?.recentLivestreams?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentLivestreams.map((stream) => (
                <div key={stream._id} className="flex items-center">
                  <div className="w-24 h-16 bg-gray-700 rounded flex items-center justify-center mr-4">
                    <FaPlay className="text-2xl text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium truncate">{stream.name}</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className={`mr-3 ${stream.status === 'active' ? 'text-green-500' :
                        stream.status === 'ended' ? 'text-gray-400' : 'text-yellow-500'
                        }`}>
                        {stream.status === 'active' ? 'Live' :
                          stream.status === 'ended' ? 'Ended' : 'Idle'}
                      </span>
                      <span className="flex items-center mr-3">
                        <FaEye className="mr-1" /> {formatNumber(stream.viewers)}
                      </span>
                      <span>{formatDate(stream.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No livestreams yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioDashboard;
