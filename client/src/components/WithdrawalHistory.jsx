import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHistory, FaCheckCircle, FaTimesCircle, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const WithdrawalHistory = () => {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/withdrawals/history`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setWithdrawals(response.data.data.withdrawals);
        }
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        showErrorToast('Failed to load withdrawal history');
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawalHistory();
  }, []);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500 text-lg" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500 text-lg" />;
      case 'processing':
        return <FaSpinner className="text-yellow-500 text-lg" />;
      case 'pending':
      default:
        return <FaInfoCircle className="text-blue-500 text-lg" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      case 'processing':
        return 'Processing';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-300';
      case 'rejected':
        return 'bg-red-900 text-red-300';
      case 'processing':
        return 'bg-yellow-900 text-yellow-300';
      case 'pending':
      default:
        return 'bg-blue-900 text-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        <span className="ml-2">Loading withdrawal history...</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <FaHistory className="mr-2 text-gray-400" />
        <h3 className="text-xl font-semibold">Withdrawal History</h3>
      </div>
      
      {withdrawals.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">You haven't made any withdrawal requests yet.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Payment Method</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="hover:bg-gray-700">
                    <td className="px-4 py-3">{formatDate(withdrawal.requestDate)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(withdrawal.amount)}</td>
                    <td className="px-4 py-3">{getPaymentMethodLabel(withdrawal.paymentMethod)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(withdrawal.status)}`}>
                          {getStatusIcon(withdrawal.status)}
                          <span className="ml-1">{getStatusText(withdrawal.status)}</span>
                        </span>
                        
                        {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                          <div className="ml-2 group relative">
                            <FaInfoCircle className="text-gray-400 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 w-48 bg-gray-900 p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              {withdrawal.rejectionReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;
