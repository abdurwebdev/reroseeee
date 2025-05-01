import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaUsers, FaClock, FaPlay, FaMoneyBillWave } from 'react-icons/fa';
import { showErrorToast } from '../../utils/toast';
import Spinner from '../Spinner';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudioAnalytics = () => {
  const [user] = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/studio/analytics`, {
          params: { period },
          withCredentials: true
        });
        
        if (response.data.success) {
          setAnalyticsData(response.data.data);
        } else {
          showErrorToast('Failed to load analytics data');
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        showErrorToast(error.response?.data?.message || 'Error loading analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalyticsData();
    }
  }, [user, period]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Prepare chart data for views
  const prepareViewsChartData = () => {
    if (!analyticsData || !analyticsData.period.dailyData) return null;
    
    const labels = analyticsData.period.dailyData.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const viewsData = analyticsData.period.dailyData.map(day => day.views);
    
    return {
      labels,
      datasets: [
        {
          label: 'Views',
          data: viewsData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  // Prepare chart data for watch time
  const prepareWatchTimeChartData = () => {
    if (!analyticsData || !analyticsData.period.dailyData) return null;
    
    const labels = analyticsData.period.dailyData.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const watchTimeData = analyticsData.period.dailyData.map(day => day.watchTimeMinutes / 60); // Convert to hours
    
    return {
      labels,
      datasets: [
        {
          label: 'Watch Time (hours)',
          data: watchTimeData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  // Prepare chart data for subscribers
  const prepareSubscribersChartData = () => {
    if (!analyticsData || !analyticsData.period.dailyData) return null;
    
    const labels = analyticsData.period.dailyData.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const subscribersGainedData = analyticsData.period.dailyData.map(day => day.subscribersGained);
    const subscribersLostData = analyticsData.period.dailyData.map(day => -day.subscribersLost);
    
    return {
      labels,
      datasets: [
        {
          label: 'Subscribers Gained',
          data: subscribersGainedData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Subscribers Lost',
          data: subscribersLostData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare chart data for traffic sources
  const prepareTrafficSourcesChartData = () => {
    if (!analyticsData || !analyticsData.trafficSources) return null;
    
    const { trafficSources } = analyticsData;
    
    return {
      labels: [
        'Direct', 
        'Suggested', 
        'Search', 
        'External', 
        'Notifications', 
        'Other'
      ],
      datasets: [
        {
          data: [
            trafficSources.direct || 0,
            trafficSources.suggested || 0,
            trafficSources.search || 0,
            trafficSources.external || 0,
            trafficSources.notifications || 0,
            trafficSources.other || 0
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(201, 203, 207, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        
        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last 365 days</option>
          </select>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <FaEye className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Total Views</h3>
              <p className="text-2xl font-bold">{formatNumber(analyticsData?.overview?.totalViews || 0)}</p>
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
              <p className="text-2xl font-bold">{formatNumber(analyticsData?.overview?.totalSubscribers || 0)}</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Total channel subscribers
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 p-3 rounded-full mr-4">
              <FaClock className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Watch Time</h3>
              <p className="text-2xl font-bold">{formatTime(analyticsData?.overview?.totalWatchTimeMinutes || 0)}</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Total watch time across all videos
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 p-3 rounded-full mr-4">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Total Earnings</h3>
              <p className="text-2xl font-bold">{formatCurrency(analyticsData?.overview?.totalEarnings || 0)}</p>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Lifetime earnings from all sources
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Views Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Views</h2>
          {prepareViewsChartData() && (
            <div className="h-80">
              <Line 
                data={prepareViewsChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
        
        {/* Watch Time Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Watch Time</h2>
          {prepareWatchTimeChartData() && (
            <div className="h-80">
              <Line 
                data={prepareWatchTimeChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
        
        {/* Subscribers Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Subscribers</h2>
          {prepareSubscribersChartData() && (
            <div className="h-80">
              <Bar 
                data={prepareSubscribersChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
        
        {/* Traffic Sources Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Traffic Sources</h2>
          {prepareTrafficSourcesChartData() && (
            <div className="h-80 flex items-center justify-center">
              <div className="w-3/4 h-full">
                <Doughnut 
                  data={prepareTrafficSourcesChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Videos */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Top Videos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3">Video</th>
                  <th className="text-right py-3">Views</th>
                  <th className="text-right py-3">Watch Time</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.topContent?.videos && analyticsData.topContent.videos.length > 0 ? (
                  analyticsData.topContent.videos.map((video, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 truncate max-w-xs">{video.title}</td>
                      <td className="py-3 text-right">{formatNumber(video.views)}</td>
                      <td className="py-3 text-right">{formatTime(video.watchTimeMinutes)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-400">No video data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Livestreams */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Top Livestreams</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3">Livestream</th>
                  <th className="text-right py-3">Views</th>
                  <th className="text-right py-3">Peak Viewers</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.topContent?.livestreams && analyticsData.topContent.livestreams.length > 0 ? (
                  analyticsData.topContent.livestreams.map((stream, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 truncate max-w-xs">{stream.title}</td>
                      <td className="py-3 text-right">{formatNumber(stream.totalViews)}</td>
                      <td className="py-3 text-right">{formatNumber(stream.peakConcurrentViewers)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-400">No livestream data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioAnalytics;
