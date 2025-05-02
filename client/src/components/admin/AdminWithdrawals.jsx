import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaSpinner, FaSearch, FaFilter } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const API_URL = "http://localhost:5000";

const AdminWithdrawals = () => {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });
  const [processingId, setProcessingId] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processData, setProcessData] = useState({
    withdrawalId: null,
    status: 'completed',
    transactionReference: '',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchWithdrawals();
  }, [filters]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      queryParams.append('page', filters.page);
      
      const response = await axios.get(
        `${API_URL}/api/withdrawals/admin/all?${queryParams.toString()}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setWithdrawals(response.data.data.withdrawals);
        setPagination(response.data.data.pagination);
      } else {
        showErrorToast('Failed to load withdrawals');
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      showErrorToast(error.response?.data?.message || 'Error loading withdrawals');
    } finally {
      setLoading(false);
    }
  };

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

  const handleProcessWithdrawal = (withdrawal) => {
    setProcessData({
      withdrawalId: withdrawal._id,
      status: 'completed',
      transactionReference: '',
      rejectionReason: ''
    });
    setShowProcessModal(true);
  };

  const handleSubmitProcess = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingId(processData.withdrawalId);
      
      const response = await axios.put(
        `${API_URL}/api/withdrawals/admin/process/${processData.withdrawalId}`,
        {
          status: processData.status,
          transactionReference: processData.status === 'completed' ? processData.transactionReference : undefined,
          rejectionReason: processData.status === 'rejected' ? processData.rejectionReason : undefined
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        showSuccessToast(`Withdrawal ${processData.status} successfully`);
        setShowProcessModal(false);
        fetchWithdrawals();
      } else {
        showErrorToast('Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      showErrorToast(error.response?.data?.message || 'Error processing withdrawal');
    } finally {
      setProcessingId(null);
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'jazzCash':
        return 'JazzCash';
      case 'easyPaisa':
        return 'EasyPaisa';
      case 'payFast':
        return 'PayFast';
      case 'bankTransfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
            <FaTimesCircle className="mr-1" />
            Rejected
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
            <FaSpinner className="mr-1 animate-spin" />
            Processing
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
            <FaSpinner className="mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
        
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
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={() => fetchWithdrawals()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <span className="ml-3">Loading withdrawals...</span>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FaMoneyBillWave className="mx-auto text-4xl text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No withdrawal requests found</h3>
          <p className="text-gray-400">
            {filters.status 
              ? `There are no ${filters.status} withdrawal requests.` 
              : 'There are no withdrawal requests to display.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left">Creator</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Payment Method</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {withdrawal.user.profileImageUrl ? (
                            <img 
                              src={withdrawal.user.profileImageUrl} 
                              alt={withdrawal.user.name} 
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-600 mr-2 flex items-center justify-center">
                              {withdrawal.user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{withdrawal.user.name}</div>
                            <div className="text-xs text-gray-400">{withdrawal.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{formatDate(withdrawal.requestDate)}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(withdrawal.amount)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div>{getPaymentMethodLabel(withdrawal.paymentMethod)}</div>
                          <div className="text-xs text-gray-400">
                            {withdrawal.paymentMethod === 'bankTransfer' 
                              ? `${withdrawal.paymentDetails.accountName} - ${withdrawal.paymentDetails.bankName}`
                              : withdrawal.paymentDetails.accountNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(withdrawal.status)}</td>
                      <td className="px-4 py-3 text-right">
                        {withdrawal.status === 'pending' && (
                          <button
                            onClick={() => handleProcessWithdrawal(withdrawal)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            disabled={processingId === withdrawal._id}
                          >
                            {processingId === withdrawal._id ? 'Processing...' : 'Process'}
                          </button>
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
      
      {/* Process Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Process Withdrawal</h2>
            
            <form onSubmit={handleSubmitProcess}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Status</label>
                <select
                  value={processData.status}
                  onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  required
                >
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {processData.status === 'completed' && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Transaction Reference</label>
                  <input
                    type="text"
                    value={processData.transactionReference}
                    onChange={(e) => setProcessData({ ...processData, transactionReference: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="Optional transaction ID or reference"
                  />
                </div>
              )}
              
              {processData.status === 'rejected' && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Rejection Reason</label>
                  <textarea
                    value={processData.rejectionReason}
                    onChange={(e) => setProcessData({ ...processData, rejectionReason: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    rows="3"
                    required
                    placeholder="Explain why this withdrawal is being rejected"
                  ></textarea>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                  disabled={processingId !== null}
                >
                  {processingId !== null ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
