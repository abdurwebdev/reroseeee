import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreatorCourseManagement from '../creator/CreatorCourseManagement';
import { FaVideo, FaBook, FaChartLine, FaUsers, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CreatorCourseDashboard = () => {
  const [user] = useOutletContext();
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    pendingPayout: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreatorStats = async () => {
      if (!user) {
        console.log("No user data available, skipping stats fetch");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching creator stats for user:", user.name);

        // Fetch creator courses
        console.log("Fetching courses from:", `${API_URL}/api/creator/courses/my-courses`);
        const coursesRes = await axios.get(`${API_URL}/api/creator/courses/my-courses`, {
          withCredentials: true
        });

        console.log("API Response for courses:", coursesRes.data);

        if (coursesRes.data.success) {
          const courses = coursesRes.data.courses;
          const publishedCourses = courses.filter(course => course.status === 'published');

          // Calculate total students (this would need a proper API endpoint in a real app)
          // For now, we'll just use a placeholder
          const totalStudents = Math.floor(Math.random() * 100); // Placeholder

          setStats({
            totalCourses: courses.length,
            publishedCourses: publishedCourses.length,
            totalStudents,
            totalEarnings: user.totalEarnings || 0,
            pendingPayout: user.pendingPayout || 0
          });

          console.log("Stats updated successfully");
        } else {
          console.error("API returned error:", coursesRes.data);
          toast.error(coursesRes.data.message || "Failed to load creator stats");
        }
      } catch (error) {
        console.error("Error fetching creator stats:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
        toast.error("Failed to load creator stats");
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorStats();
  }, [user]);

  useEffect(() => {
    // Log user information for debugging
    console.log("User in CreatorCourseDashboard:", user);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] flex-col">
        <div className="text-red-500 text-xl mb-4">Error: User information not available</div>
        <p className="text-gray-400">Please try refreshing the page or logging in again.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Course Dashboard</h1>
          <p className="text-gray-400">Manage your courses and track your earnings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center mr-4">
            <FaBook className="text-blue-400 text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Courses</p>
            <p className="text-2xl font-bold">{stats.totalCourses}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center mr-4">
            <FaVideo className="text-green-400 text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Published Courses</p>
            <p className="text-2xl font-bold">{stats.publishedCourses || 0}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center mr-4">
            <FaUsers className="text-purple-400 text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-yellow-900 flex items-center justify-center mr-4">
            <FaMoneyBillWave className="text-yellow-400 text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Earnings</p>
            {user && user.subscriberCount >= 1000 &&
              ((user.totalWatchTimeMinutes >= 240000) || (user.totalShortViews >= 10000000)) ? (
              <>
                <p className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</p>
                <p className="text-xs text-green-400">₹{stats.pendingPayout.toFixed(2)} pending</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">--</p>
                <p className="text-xs text-yellow-400">Meet requirements to view earnings</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'courses'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
          >
            Courses
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'earnings'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
          >
            Earnings
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' && (
        <CreatorCourseManagement />
      )}

      {activeTab === 'earnings' && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Earnings</h2>

          {user && user.subscriberCount >= 1000 &&
            ((user.totalWatchTimeMinutes >= 240000) || (user.totalShortViews >= 10000000)) ? (
            <>
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Available for withdrawal</h3>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                    Withdraw Funds
                  </button>
                </div>

                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">₹{stats.pendingPayout.toFixed(2)}</span>
                  <span className="text-gray-400 ml-2">available balance</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Earnings History</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {stats.totalEarnings > 0 ? (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">Sample Course</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-400">{new Date().toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">₹{(stats.totalEarnings * 0.7).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">
                              Paid
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                            No earnings history yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Earnings Requirements</h3>
              <p className="text-lg mb-4">Your earnings will be displayed once you meet the following requirements:</p>

              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Subscribers</span>
                    <span className={user && user.subscriberCount >= 1000 ? "text-green-400" : "text-gray-400"}>
                      {user ? user.subscriberCount || 0 : 0}/1,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${user && user.subscriberCount >= 1000 ? "bg-green-600" : "bg-blue-600"}`}
                      style={{ width: `${Math.min(100, ((user?.subscriberCount || 0) / 1000) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Watch Hours</span>
                    <span className={user && user.totalWatchTimeMinutes >= 240000 ? "text-green-400" : "text-gray-400"}>
                      {user ? Math.floor((user.totalWatchTimeMinutes || 0) / 60) : 0}/4,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${user && user.totalWatchTimeMinutes >= 240000 ? "bg-green-600" : "bg-blue-600"}`}
                      style={{ width: `${Math.min(100, ((user?.totalWatchTimeMinutes || 0) / 240000) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Short Views</span>
                    <span className={user && user.totalShortViews >= 10000000 ? "text-green-400" : "text-gray-400"}>
                      {user ? (user.totalShortViews || 0).toLocaleString() : 0}/10,000,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${user && user.totalShortViews >= 10000000 ? "bg-green-600" : "bg-blue-600"}`}
                      style={{ width: `${Math.min(100, ((user?.totalShortViews || 0) / 10000000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mt-4">
                You need at least 1,000 subscribers and either 4,000 hours of watch time or 10 million short views to view your earnings.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Analytics</h2>

          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <FaChartLine className="mx-auto text-gray-600 text-5xl mb-4" />
            <p className="text-gray-400 text-lg">Analytics coming soon</p>
            <p className="text-gray-500 text-sm mt-2">
              We're working on providing detailed analytics for your courses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCourseDashboard;
