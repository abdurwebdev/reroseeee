import React, { useState } from 'react';
import { FaAd, FaTimes, FaInfoCircle } from 'react-icons/fa';
import PaymentForm from './payment/PaymentForm';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const AdCreditPurchaseModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const predefinedAmounts = [1000, 2500, 5000, 10000, 25000];
  
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };
  
  const handlePredefinedAmount = (value) => {
    setAmount(value.toString());
  };
  
  const handleContinue = () => {
    const numAmount = parseInt(amount, 10);
    
    if (!numAmount || numAmount < 1000) {
      showErrorToast('Please enter a valid amount (minimum 1,000 PKR)');
      return;
    }
    
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = (paymentId) => {
    showSuccessToast(`Ad credits purchased successfully!`);
    if (onSuccess) {
      onSuccess(parseInt(amount, 10));
    }
    onClose();
  };
  
  const handleCancel = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false);
    } else {
      onClose();
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        
        {!showPaymentForm ? (
          <>
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 p-3 rounded-full mr-4">
                <FaAd className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold">Purchase Ad Credits</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              Ad credits can be used to promote your content across the platform. Choose an amount below or enter a custom amount.
            </p>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Amount (PKR)</label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Suggested Amounts</label>
              <div className="grid grid-cols-3 gap-2">
                {predefinedAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handlePredefinedAmount(value)}
                    className={`p-2 rounded-lg ${
                      amount === value.toString() 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {formatCurrency(value)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <FaInfoCircle className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="mb-2">Ad credits are non-refundable and will be available in your ad account immediately after purchase.</p>
                  <p>1 PKR = 1 ad credit. Minimum purchase amount is 1,000 PKR.</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <PaymentForm
            amount={parseInt(amount, 10)}
            purpose="adCredit"
            description={`Ad Credits Purchase (${formatCurrency(parseInt(amount, 10))})`}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default AdCreditPurchaseModal;
