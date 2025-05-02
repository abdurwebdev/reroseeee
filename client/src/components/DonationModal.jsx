import React, { useState } from 'react';
import { FaHeart, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import PaymentForm from './payment/PaymentForm';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const DonationModal = ({ isOpen, onClose, creator }) => {
  const [amount, setAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const predefinedAmounts = [100, 200, 500, 1000, 2000];
  
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };
  
  const handlePredefinedAmount = (value) => {
    setAmount(value.toString());
  };
  
  const handleContinue = () => {
    const numAmount = parseInt(amount, 10);
    
    if (!numAmount || numAmount < 10) {
      showErrorToast('Please enter a valid amount (minimum 10 PKR)');
      return;
    }
    
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = (paymentId) => {
    showSuccessToast(`Thank you for supporting ${creator.name}!`);
    onClose();
  };
  
  const handleCancel = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false);
    } else {
      onClose();
    }
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
              <div className="bg-red-600 p-3 rounded-full mr-4">
                <FaHeart className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold">Support {creator.name}</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              Your donation helps {creator.name} create more amazing content. Choose an amount below or enter a custom amount.
            </p>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Donation Amount (PKR)</label>
              <div className="flex">
                <div className="bg-gray-800 px-3 py-2 rounded-l-lg flex items-center">
                  <FaMoneyBillWave className="text-green-500" />
                </div>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
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
                    {value} PKR
                  </button>
                ))}
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
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <PaymentForm
            amount={parseInt(amount, 10)}
            purpose="donation"
            referenceId={creator._id}
            referenceModel="User"
            description={`Donation to ${creator.name}`}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default DonationModal;
