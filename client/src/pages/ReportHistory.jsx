import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeedSidebar from '../components/FeedSidebar';
import { FaFlag, FaExclamationTriangle, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const ReportHistory = () => {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // Fetch user's reports
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/reports/user-reports`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setReports(res.data.reports);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        showErrorToast('Failed to load report history');
        setLoading(false);
      }
    };

    // Fetch user's subscriptions for sidebar
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/subscriptions/user-subscriptions`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setSubscriptions(res.data.subscriptions);
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
      }
    };
    
    fetchReports();
    fetchSubscriptions();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <FaCheck className="text-green-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      case 'pending':
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-900 text-green-300';
      case 'rejected':
        return 'bg-red-900 text-red-300';
      case 'pending':
      default:
        return 'bg-yellow-900 text-yellow-300';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'harassment':
        return 'Harassment or Bullying';
      case 'violence':
        return 'Violent or Repulsive Content';
      case 'hateSpeech':
        return 'Hate Speech';
      case 'spam':
        return 'Spam or Misleading';
      case 'copyright':
        return 'Copyright Infringement';
      case 'sexual':
        return 'Sexual Content';
      case 'childAbuse':
        return 'Child Abuse';
      case 'other':
      default:
        return 'Other';
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="flex">
        <FeedSidebar subscriptions={subscriptions} />
        
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Report History</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FaFlag className="mx-auto text-4xl text-gray-500 mb-4" />
              <h2 className="text-xl mb-4">No reports submitted</h2>
              <p className="text-gray-400">You haven't reported any content yet</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Content</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-700">
                        <td className="px-4 py-3">{formatDate(report.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">
                              {report.contentType === 'video' ? 'Video: ' : 
                               report.contentType === 'comment' ? 'Comment: ' : 
                               report.contentType === 'channel' ? 'Channel: ' : 
                               'Content: '}
                              {report.contentTitle || 'Untitled'}
                            </div>
                            {report.contentDescription && (
                              <div className="text-sm text-gray-400 line-clamp-1">
                                {report.contentDescription}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                            <FaExclamationTriangle className="mr-1 text-yellow-500" />
                            {getCategoryLabel(report.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{getStatusText(report.status)}</span>
                          </span>
                          {report.adminResponse && (
                            <div className="mt-1 text-xs text-gray-400">
                              {report.adminResponse}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">About Content Reporting</h2>
            <p className="text-gray-300 mb-4">
              Thank you for helping keep our platform safe and appropriate for all users. When you report content, our moderation team reviews it to determine if it violates our community guidelines.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaClock className="text-yellow-500 mr-2" /> Pending
                </h3>
                <p className="text-sm text-gray-400">
                  Your report is being reviewed by our moderation team. This typically takes 1-3 business days.
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaCheck className="text-green-500 mr-2" /> Resolved
                </h3>
                <p className="text-sm text-gray-400">
                  Your report was reviewed and action was taken. The content may have been removed or restricted.
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaTimes className="text-red-500 mr-2" /> Rejected
                </h3>
                <p className="text-sm text-gray-400">
                  After review, we determined that the reported content does not violate our community guidelines.
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaExclamationTriangle className="text-yellow-500 mr-2" /> Report Again
                </h3>
                <p className="text-sm text-gray-400">
                  If you believe a rejected report should be reconsidered, you can report the content again with additional details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ReportHistory;
