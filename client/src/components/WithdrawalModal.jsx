import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const WithdrawalModal = ({ isOpen, onClose, pendingAmount, onWithdrawalComplete }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('jazzCash');
  const [paymentMethods, setPaymentMethods] = useState({
    jazzCash: null,
    easyPaisa: null,
    payFast: null,
    bankDetails: {
      accountTitle: null,
      accountNumber: null,
      bankName: null
    }
  });
  const [availableMethods, setAvailableMethods] = useState([]);

  useEffect(() => {
    // Fetch user's payment methods
    const fetchPaymentMethods = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/studio/payment-methods`, {
          withCredentials: true
        });
        
        if (res.data.success) {
          setPaymentMethods(res.data.data.paymentMethods);
          
          // Determine available methods
          const methods = [];
          if (res.data.data.paymentMethods.jazzCash) {
            methods.push('jazzCash');
          }
          if (res.data.data.paymentMethods.easyPaisa) {
            methods.push('easyPaisa');
          }
          if (res.data.data.paymentMethods.payFast) {
            methods.push('payFast');
          }
          if (res.data.data.paymentMethods.bankDetails?.accountNumber) {
            methods.push('bankTransfer');
          }
          
          setAvailableMethods(methods);
          
          // Set default payment method
          if (methods.length > 0 && !methods.includes(paymentMethod)) {
            setPaymentMethod(methods[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        showErrorToast('Failed to load payment methods');
      }
    };
    
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      showErrorToast('Please select a payment method');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/api/withdrawals/request`,
        { paymentMethod },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        showSuccessToast('Withdrawal request submitted successfully');
        onWithdrawalComplete();
        onClose();
      } else {
        showErrorToast('Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      showErrorToast(error.response?.data?.message || 'Error submitting withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
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

  const getPaymentMethodDetails = (method) => {
    switch (method) {
      case 'jazzCash':
        return paymentMethods.jazzCash;
      case 'easyPaisa':
        return paymentMethods.easyPaisa;
      case 'payFast':
        return paymentMethods.payFast;
      case 'bankTransfer':
        return `${paymentMethods.bankDetails.accountTitle} - ${paymentMethods.bankDetails.accountNumber} (${paymentMethods.bankDetails.bankName})`;
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        
        <div className="flex items-center mb-6">
          <div className="bg-green-600 p-3 rounded-full mr-4">
            <FaMoneyBillWave className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold">Withdraw Earnings</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-2">Available for withdrawal:</p>
          <p className="text-3xl font-bold text-green-500">{formatCurrency(pendingAmount)}</p>
        </div>
        
        {availableMethods.length === 0 ? (
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <p className="text-yellow-400 mb-2">No payment methods available</p>
            <p className="text-gray-300">
              Please add a payment method in your account settings before requesting a withdrawal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Select Payment Method</label>
              <select
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                {availableMethods.map(method => (
                  <option key={method} value={method}>
                    {getPaymentMethodLabel(method)}
                  </option>
                ))}
              </select>
              
              {paymentMethod && (
                <div className="mt-2 text-gray-400">
                  <p>Payment will be sent to: {getPaymentMethodDetails(paymentMethod)}</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <p className="text-gray-300 text-sm">
                <strong>Note:</strong> Withdrawal requests are typically processed within 3-5 business days.
                You will receive a notification once your withdrawal has been processed.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawalModal;
