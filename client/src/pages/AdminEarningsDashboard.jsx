import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { Line, Bar, Pie } from 'react-chartjs-2';
import AdminWithdrawalModal from '../components/admin/AdminWithdrawalModal';
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

const AdminEarningsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [platformRevenue, setPlatformRevenue] = useState({
    platformRevenue: 0,
    recentWithdrawals: [],
    totalWithdrawn: 0,
    availableForWithdrawal: 0
  });
  const [dateRange, setDateRange] = useState(30); // Default to 30 days
  const [settingsMode, setSettingsMode] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [settings, setSettings] = useState({
    viewEarningRate: 0.01,
    adImpressionRate: 0.05,
    adClickRate: 0.50,
    subscriptionSharingRate: 70,
    minimumPayoutAmount: 1000,
    paymentMethods: {
      jazzCash: true,
      easyPaisa: true,
      payFast: false,
      bankTransfer: false
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/check", {
          withCredentials: true
        });

        if (res.data.user.role !== "admin") {
          showErrorToast("Only admins can access this page");
          navigate("/");
        } else {
          setAdmin(res.data.user);
        }
      } catch (error) {
        showErrorToast("Authentication error");
        navigate("/login");
      }
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    // Fetch earnings data when admin is authenticated and date range changes
    if (admin) {
      fetchEarningsData();
      fetchPlatformRevenue();
    }
  }, [admin, dateRange]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/earnings/admin/summary?days=${dateRange}`, {
        withCredentials: true
      });

      setEarningsData(res.data.data);

      // Update settings from server
      if (res.data.data.settings) {
        setSettings(res.data.data.settings);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      setError('Failed to load earnings data');
      setLoading(false);
    }
  };

  const fetchPlatformRevenue = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/withdrawals/admin/platform-revenue?days=${dateRange}`, {
        withCredentials: true
      });

      if (res.data.success) {
        setPlatformRevenue(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching platform revenue:', error);
      showErrorToast('Failed to load platform revenue data');
    }
  };

  const handleWithdrawalComplete = () => {
    fetchPlatformRevenue();
  };

  const handleUpdateSettings = async () => {
    try {
      setLoading(true);

      const res = await axios.put('http://localhost:5000/api/earnings/admin/settings', settings, {
        withCredentials: true
      });

      if (res.data.success) {
        showSuccessToast('Monetization settings updated successfully');
        setSettingsMode(false);
        fetchEarningsData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showErrorToast(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareRevenueChartData = () => {
    if (!earningsData || !earningsData.dailyEarnings) return null;

    const labels = earningsData.dailyEarnings.map(item => item._id);
    const platformData = earningsData.dailyEarnings.map(item => item.platformAmount);

    return {
      labels,
      datasets: [
        {
          label: 'Platform Revenue (PKR)',
          data: platformData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }
      ]
    };
  };

  const prepareSourceChartData = () => {
    if (!earningsData || !earningsData.summary.bySource) return null;

    const labels = earningsData.summary.bySource.map(item => {
      const sourceLabels = {
        'video_view': 'Video Views',
        'livestream_view': 'Livestream Views',
        'ad_impression': 'Ad Impressions',
        'ad_click': 'Ad Clicks',
        'subscription': 'Subscriptions'
      };
      return sourceLabels[item._id] || item._id;
    });

    const platformData = earningsData.summary.bySource.map(item => item.platformEarnings);
    const creatorData = earningsData.summary.bySource.map(item => item.creatorEarnings);

    return {
      labels,
      datasets: [
        {
          label: 'Platform Revenue',
          data: platformData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
          <div className="text-2xl">Loading earnings data...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
          <div className="text-2xl text-red-500 mb-4">{error}</div>
          <button
            onClick={fetchEarningsData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Earnings Dashboard</h1>
          <div className="flex space-x-4">
            <select
              className="bg-gray-800 text-white px-4 py-2 rounded"
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>

            <button
              onClick={() => setSettingsMode(!settingsMode)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              {settingsMode ? 'View Dashboard' : 'Monetization Settings'}
            </button>
          </div>
        </div>

        {/* Admin Withdrawal Modal */}
        <AdminWithdrawalModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          availableAmount={platformRevenue.availableForWithdrawal || 0}
          onWithdrawalComplete={handleWithdrawalComplete}
        />

        {settingsMode ? (
          // Monetization Settings UI
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Monetization Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Video View Earning Rate (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.viewEarningRate}
                    onChange={(e) => setSettings({ ...settings, viewEarningRate: parseFloat(e.target.value) })}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ad Impression Rate (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.adImpressionRate}
                    onChange={(e) => setSettings({ ...settings, adImpressionRate: parseFloat(e.target.value) })}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ad Click Rate (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.adClickRate}
                    onChange={(e) => setSettings({ ...settings, adClickRate: parseFloat(e.target.value) })}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Creator Revenue Share (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.subscriptionSharingRate}
                    onChange={(e) => setSettings({ ...settings, subscriptionSharingRate: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Platform keeps {100 - settings.subscriptionSharingRate}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Minimum Payout Amount (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.minimumPayoutAmount}
                    onChange={(e) => setSettings({ ...settings, minimumPayoutAmount: parseFloat(e.target.value) })}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Payment Methods
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="jazzCash"
                        checked={settings.paymentMethods.jazzCash}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            jazzCash: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="jazzCash">JazzCash</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="easyPaisa"
                        checked={settings.paymentMethods.easyPaisa}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            easyPaisa: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="easyPaisa">EasyPaisa</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="payFast"
                        checked={settings.paymentMethods.payFast}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            payFast: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="payFast">PayFast</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="bankTransfer"
                        checked={settings.paymentMethods.bankTransfer}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentMethods: {
                            ...settings.paymentMethods,
                            bankTransfer: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="bankTransfer">Bank Transfer</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleUpdateSettings}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        ) : (
          // Dashboard UI
          <>
            {earningsData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-medium text-blue-200">Total Platform Revenue</h3>
                    <p className="text-3xl font-bold mt-2">
                      {formatCurrency(earningsData.summary.total.platformTotal || 0)}
                    </p>
                    <p className="text-sm text-blue-200 mt-1">
                      Last {dateRange} days
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-medium text-purple-200">Creator Payouts</h3>
                    <p className="text-3xl font-bold mt-2">
                      {formatCurrency(earningsData.summary.total.creatorTotal || 0)}
                    </p>
                    <p className="text-sm text-purple-200 mt-1">
                      Last {dateRange} days
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-medium text-green-200">Total Transactions</h3>
                    <p className="text-3xl font-bold mt-2">
                      {earningsData.summary.total.count || 0}
                    </p>
                    <p className="text-sm text-green-200 mt-1">
                      Last {dateRange} days
                    </p>
                  </div>

                  <div
                    className="bg-gradient-to-r from-red-900 to-red-700 rounded-lg p-6 shadow-lg cursor-pointer hover:from-red-800 hover:to-red-600"
                    onClick={() => setShowWithdrawalModal(true)}
                  >
                    <h3 className="text-lg font-medium text-red-200">Available for Withdrawal</h3>
                    <p className="text-3xl font-bold mt-2">
                      {formatCurrency(platformRevenue.availableForWithdrawal || 0)}
                    </p>
                    <p className="text-sm text-red-200 mt-1">
                      Click to withdraw funds
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Daily Revenue</h3>
                    {prepareRevenueChartData() && (
                      <div className="h-80">
                        <Line
                          data={prepareRevenueChartData()}
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

                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Revenue by Source</h3>
                    {prepareSourceChartData() && (
                      <div className="h-80 flex items-center justify-center">
                        <Pie
                          data={prepareSourceChartData()}
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
                    )}
                  </div>
                </div>

                {/* Top Content & Creators */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Top Earning Content</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3">Content</th>
                            <th className="text-left py-3">Type</th>
                            <th className="text-left py-3">Creator</th>
                            <th className="text-right py-3">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earningsData.topContent && earningsData.topContent.length > 0 ? (
                            earningsData.topContent.map((item, index) => (
                              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                                <td className="py-3">
                                  {item.contentDetails?.title || item.contentDetails?.name || 'Unknown'}
                                </td>
                                <td className="py-3">
                                  {item._id.contentModel === 'FreeVideo' ? 'Video' : 'Livestream'}
                                </td>
                                <td className="py-3">
                                  {item.contentDetails?.uploader || 'Unknown'}
                                </td>
                                <td className="py-3 text-right">
                                  {formatCurrency(item.totalEarnings)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-4 text-center text-gray-500">
                                No data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Top Earning Creators</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3">Creator</th>
                            <th className="text-left py-3">Email</th>
                            <th className="text-right py-3">Earnings</th>
                            <th className="text-right py-3">Platform Cut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earningsData.topCreators && earningsData.topCreators.length > 0 ? (
                            earningsData.topCreators.map((item, index) => (
                              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                                <td className="py-3">
                                  {item.creator?.name || 'Unknown'}
                                </td>
                                <td className="py-3">
                                  {item.creator?.email || 'Unknown'}
                                </td>
                                <td className="py-3 text-right">
                                  {formatCurrency(item.creatorEarnings)}
                                </td>
                                <td className="py-3 text-right">
                                  {formatCurrency(item.totalEarnings - item.creatorEarnings)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-4 text-center text-gray-500">
                                No data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Admin Withdrawals */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Recent Admin Withdrawals</h3>
                    <button
                      onClick={() => setShowWithdrawalModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                    >
                      New Withdrawal
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3">Date</th>
                          <th className="text-left py-3">Amount</th>
                          <th className="text-left py-3">Payment Method</th>
                          <th className="text-left py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platformRevenue.recentWithdrawals && platformRevenue.recentWithdrawals.length > 0 ? (
                          platformRevenue.recentWithdrawals.map((withdrawal, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                              <td className="py-3">
                                {new Date(withdrawal.requestDate).toLocaleDateString('en-PK', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-3">
                                {formatCurrency(withdrawal.amount)}
                              </td>
                              <td className="py-3">
                                {withdrawal.paymentMethod === 'jazzCash' ? 'JazzCash' :
                                  withdrawal.paymentMethod === 'easyPaisa' ? 'EasyPaisa' :
                                    withdrawal.paymentMethod === 'payFast' ? 'PayFast' :
                                      'Bank Transfer'}
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${withdrawal.status === 'completed' ? 'bg-green-900 text-green-300' :
                                    withdrawal.status === 'rejected' ? 'bg-red-900 text-red-300' :
                                      withdrawal.status === 'processing' ? 'bg-yellow-900 text-yellow-300' :
                                        'bg-blue-900 text-blue-300'
                                  }`}>
                                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-500">
                              No recent withdrawals
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminEarningsDashboard;
