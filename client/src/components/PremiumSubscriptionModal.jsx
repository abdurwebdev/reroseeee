import React, { useState } from 'react';
import { FaCrown, FaTimes, FaCheck } from 'react-icons/fa';
import PaymentForm from './payment/PaymentForm';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const PremiumSubscriptionModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const plans = {
    monthly: {
      id: 'monthly',
      name: 'Monthly',
      price: 499,
      period: 'month',
      description: 'Billed monthly'
    },
    quarterly: {
      id: 'quarterly',
      name: 'Quarterly',
      price: 1299,
      period: 'quarter',
      description: 'Billed every 3 months (save 13%)'
    },
    yearly: {
      id: 'yearly',
      name: 'Yearly',
      price: 4999,
      period: 'year',
      description: 'Billed annually (save 16%)'
    }
  };
  
  const benefits = [
    'Ad-free viewing experience',
    'Background play on mobile devices',
    'Download videos for offline viewing',
    'Access to exclusive premium content',
    'Early access to new features',
    'Premium badge on your profile and comments'
  ];
  
  const handleContinue = () => {
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = (paymentId) => {
    showSuccessToast('Welcome to Premium! Your subscription is now active.');
    if (onSuccess) {
      onSuccess(plans[selectedPlan]);
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        
        {!showPaymentForm ? (
          <>
            <div className="flex items-center mb-6">
              <div className="bg-yellow-600 p-3 rounded-full mr-4">
                <FaCrown className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.values(plans).map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg cursor-pointer border-2 ${
                    selectedPlan === plan.id 
                      ? 'border-yellow-500 bg-gray-800' 
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 ml-1">PKR/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Premium Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <FaCheck className="text-green-500 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
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
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <PaymentForm
            amount={plans[selectedPlan].price}
            purpose="premium"
            description={`Premium Subscription (${plans[selectedPlan].name})`}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default PremiumSubscriptionModal;
