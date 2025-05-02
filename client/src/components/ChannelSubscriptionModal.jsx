import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaTimes, FaCheck } from 'react-icons/fa';
import PaymentForm from './payment/PaymentForm';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const ChannelSubscriptionModal = ({ isOpen, onClose, channel, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  useEffect(() => {
    if (isOpen && channel) {
      fetchSubscriptionPlans();
    }
  }, [isOpen, channel]);
  
  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/api/channels/${channel._id}/subscription-plans`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const plans = response.data.data.plans;
        setSubscriptionPlans(plans);
        
        // Select the first plan by default
        if (plans.length > 0) {
          setSelectedPlan(plans[0]);
        }
      } else {
        showErrorToast('Failed to load subscription plans');
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      showErrorToast('Error loading subscription plans');
    } finally {
      setLoading(false);
    }
  };
  
  const handleContinue = () => {
    if (!selectedPlan) {
      showErrorToast('Please select a subscription plan');
      return;
    }
    
    setShowPaymentForm(true);
  };
  
  const handlePaymentSuccess = (paymentId) => {
    showSuccessToast(`You are now subscribed to ${channel.name}!`);
    if (onSuccess) {
      onSuccess(selectedPlan);
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
  
  // Default plans if none are available from the server
  const defaultPlans = [
    {
      _id: 'basic',
      name: 'Basic',
      price: 199,
      period: 'month',
      description: 'Support the creator and get basic perks',
      benefits: [
        'Ad-free channel videos',
        'Subscriber badge in comments',
        'Access to subscriber-only community posts'
      ]
    },
    {
      _id: 'premium',
      name: 'Premium',
      price: 499,
      period: 'month',
      description: 'Get premium perks and exclusive content',
      benefits: [
        'All Basic benefits',
        'Early access to new videos',
        'Exclusive premium content',
        'Monthly Q&A sessions'
      ]
    },
    {
      _id: 'vip',
      name: 'VIP',
      price: 999,
      period: 'month',
      description: 'Ultimate fan experience with VIP perks',
      benefits: [
        'All Premium benefits',
        'Personal shoutouts in videos',
        'Behind-the-scenes content',
        'Direct messaging with creator',
        'Input on future content'
      ]
    }
  ];
  
  const plans = subscriptionPlans.length > 0 ? subscriptionPlans : defaultPlans;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : !showPaymentForm ? (
          <>
            <div className="flex items-center mb-6">
              <div className="bg-purple-600 p-3 rounded-full mr-4">
                <FaStar className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Subscribe to {channel.name}</h2>
                <p className="text-gray-400">Support {channel.name} and get exclusive perks</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`p-5 rounded-lg cursor-pointer border-2 ${
                    selectedPlan && selectedPlan._id === plan._id 
                      ? 'border-purple-500 bg-gray-800' 
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 ml-1">PKR/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                  
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Benefits:</h4>
                  <ul className="space-y-2">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <PaymentForm
            amount={selectedPlan.price}
            purpose="subscription"
            referenceId={channel._id}
            referenceModel="Channel"
            description={`${selectedPlan.name} Subscription to ${channel.name}`}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ChannelSubscriptionModal;
