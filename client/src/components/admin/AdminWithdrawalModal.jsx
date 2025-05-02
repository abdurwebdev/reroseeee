import React, { useState } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const API_URL = "http://localhost:5000";

const AdminWithdrawalModal = ({ isOpen, onClose, availableAmount, onWithdrawalComplete }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: 'jazzCash',
    amount: '',
    paymentDetails: {
      accountNumber: '',
      accountName: '',
      bankName: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      paymentDetails: {
        ...formData.paymentDetails,
        [name]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showErrorToast('Please enter a valid amount');
      return;
    }
    
    if (amount > availableAmount) {
      showErrorToast(`You can only withdraw up to ${formatCurrency(availableAmount)}`);
      return;
    }
    
    // Validate payment details
    if (formData.paymentMethod === 'bankTransfer') {
      if (!formData.paymentDetails.accountName || !formData.paymentDetails.accountNumber || !formData.paymentDetails.bankName) {
        showErrorToast('Please fill in all bank details');
        return;
      }
    } else if (!formData.paymentDetails.accountNumber) {
      showErrorToast('Please enter your account number');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/api/withdrawals/admin/request`,
        {
          paymentMethod: formData.paymentMethod,
          amount,
          paymentDetails: formData.paymentDetails
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        showSuccessToast('Admin withdrawal request submitted successfully');
        if (onWithdrawalComplete) {
          onWithdrawalComplete();
        }
        onClose();
      } else {
        showErrorToast('Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting admin withdrawal request:', error);
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
          <div className="bg-purple-600 p-3 rounded-full mr-4">
            <FaMoneyBillWave className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold">Admin Withdrawal</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-2">Available for withdrawal:</p>
          <p className="text-3xl font-bold text-green-500">{formatCurrency(availableAmount)}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Amount to Withdraw</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded"
              required
            >
              <option value="jazzCash">JazzCash</option>
              <option value="easyPaisa">EasyPaisa</option>
              <option value="payFast">PayFast</option>
              <option value="bankTransfer">Bank Transfer</option>
            </select>
          </div>
          
          {formData.paymentMethod === 'bankTransfer' ? (
            <>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Account Name</label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.paymentDetails.accountName}
                  onChange={handlePaymentDetailsChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  placeholder="Enter account name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.paymentDetails.accountNumber}
                  onChange={handlePaymentDetailsChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  placeholder="Enter account number"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.paymentDetails.bankName}
                  onChange={handlePaymentDetailsChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  placeholder="Enter bank name"
                  required
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.paymentDetails.accountNumber}
                onChange={handlePaymentDetailsChange}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                placeholder="Enter account number"
                required
              />
            </div>
          )}
          
          <div className="flex justify-end mt-6">
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
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Withdraw Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminWithdrawalModal;
