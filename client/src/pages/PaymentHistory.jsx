import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeedSidebar from '../components/FeedSidebar';
import { FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaDownload, FaFilter } from 'react-icons/fa';
import { showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const PaymentHistory = () => {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
    
    // Fetch user's payment history
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        
        const queryParams = new URLSearchParams();
        if (filters.status) {
          queryParams.append('status', filters.status);
        }
        queryParams.append('page', filters.page);
        
        const res = await axios.get(`${API_URL}/api/payments/history?${queryParams.toString()}`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setPayments(res.data.data.payments);
          setPagination(res.data.data.pagination);
        } else {
          showErrorToast('Failed to load payment history');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        showErrorToast('Failed to load payment history');
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
    
    fetchPaymentHistory();
    fetchSubscriptions();
  }, [navigate, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page when changing filters
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    
    setFilters({
      ...filters,
      page: newPage
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500" />;
      case 'refunded':
        return <FaDownload className="text-blue-500" />;
      case 'pending':
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-300';
      case 'failed':
        return 'bg-red-900 text-red-300';
      case 'refunded':
        return 'bg-blue-900 text-blue-300';
      case 'pending':
      default:
        return 'bg-yellow-900 text-yellow-300';
    }
  };

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case 'subscription':
        return 'Channel Subscription';
      case 'donation':
        return 'Creator Donation';
      case 'premium':
        return 'Premium Subscription';
      case 'adCredit':
        return 'Advertising Credit';
      case 'course':
        return 'Course Purchase';
      default:
        return 'Payment';
    }
  };

  const getPaymentMethodLabel = (gateway) => {
    switch (gateway) {
      case 'jazzCash':
        return 'JazzCash';
      case 'easyPaisa':
        return 'EasyPaisa';
      case 'payFast':
        return 'PayFast';
      case 'bankTransfer':
        return 'Bank Transfer';
      default:
        return gateway;
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="flex">
        <FeedSidebar subscriptions={subscriptions} />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Payment History</h1>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FaHistory className="mx-auto text-4xl text-gray-500 mb-4" />
              <h2 className="text-xl mb-4">No payment history</h2>
              <p className="text-gray-400">You haven't made any payments yet</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Payment Method</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {payments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-700">
                          <td className="px-4 py-3">{formatDate(payment.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{getPurposeLabel(payment.purpose)}</div>
                            <div className="text-sm text-gray-400">
                              {payment.transactionId || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="px-4 py-3">{getPaymentMethodLabel(payment.gateway)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1">{getStatusText(payment.status)}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {payment.status === 'completed' && (
                              <Link
                                to={`/payment/success?paymentId=${payment._id}`}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                View Details
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className={`px-3 py-1 rounded ${
                        filters.page === 1 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current page
                        return page === 1 || 
                               page === pagination.pages || 
                               Math.abs(page - filters.page) <= 1;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there are gaps
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-3 py-1 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded ${
                                page === filters.page 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-800 text-white hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === pagination.pages}
                      className={`px-3 py-1 rounded ${
                        filters.page === pagination.pages 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentHistory;
