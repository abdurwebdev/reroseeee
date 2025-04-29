import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const ChannelSubscribe = ({ channelId, channelName }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Get user from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }

    // Check if user is subscribed to this channel
    const checkSubscription = async () => {
      if (!channelId || !storedUser) return;

      try {
        const res = await axiosInstance.get(`/api/subscriptions/check/${channelId}`);

        if (res.data.success) {
          setIsSubscribed(res.data.isSubscribed);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };

    // Get subscriber count
    const getSubscriberCount = async () => {
      if (!channelId) return;

      try {
        const res = await axiosInstance.get(`/api/subscriptions/count/${channelId}`);

        if (res.data.success) {
          setSubscriberCount(res.data.subscriberCount);
        }
      } catch (err) {
        console.error('Error getting subscriber count:', err);
      }
    };

    checkSubscription();
    getSubscriberCount();
  }, [channelId]);

  const handleSubscribe = async () => {
    if (!user) {
      showErrorToast('Please log in to subscribe to channels');
      return;
    }

    if (user._id === channelId) {
      showErrorToast('You cannot subscribe to your own channel');
      return;
    }

    setLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const res = await axiosInstance.post('/api/subscriptions/unsubscribe', { channelId });

        if (res.data.success) {
          setIsSubscribed(false);
          setSubscriberCount(prev => Math.max(0, prev - 1));
          showSuccessToast(`Unsubscribed from ${channelName}`);
        }
      } else {
        // Subscribe
        const res = await axiosInstance.post('/api/subscriptions/subscribe', { channelId });

        if (res.data.success) {
          setIsSubscribed(true);
          setSubscriberCount(prev => prev + 1);
          showSuccessToast(`Subscribed to ${channelName}`);
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
      showErrorToast(err.response?.data?.message || 'Error updating subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleSubscribe}
        disabled={loading || !user || user._id === channelId}
        className={`px-4 py-1.5 rounded-full font-medium text-sm transition-colors ${isSubscribed
          ? 'bg-gray-700 hover:bg-gray-600 text-white'
          : 'bg-red-600 hover:bg-red-700 text-white'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
      </button>
      <span className="text-sm text-gray-400">
        {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
      </span>
    </div>
  );
};

export default ChannelSubscribe;
