import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaMoneyBillWave, FaUserShield, FaBell } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Spinner from '../Spinner';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudioSettings = () => {
  const [user, setUser] = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');
  
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethod: 'jazzCash',
    accountName: '',
    accountNumber: '',
    bankName: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        
        if (response.data.user) {
          // Pre-fill payment settings if available
          const userData = response.data.user;
          
          let defaultPaymentMethod = 'jazzCash';
          let defaultAccountName = '';
          let defaultAccountNumber = '';
          let defaultBankName = '';
          
          if (userData.paymentMethods) {
            if (userData.paymentMethods.jazzCash) {
              defaultPaymentMethod = 'jazzCash';
              defaultAccountNumber = userData.paymentMethods.jazzCash;
            } else if (userData.paymentMethods.easyPaisa) {
              defaultPaymentMethod = 'easyPaisa';
              defaultAccountNumber = userData.paymentMethods.easyPaisa;
            } else if (userData.paymentMethods.payFast) {
              defaultPaymentMethod = 'payFast';
              defaultAccountNumber = userData.paymentMethods.payFast;
            } else if (userData.paymentMethods.bankDetails?.accountNumber) {
              defaultPaymentMethod = 'bankTransfer';
              defaultAccountName = userData.paymentMethods.bankDetails.accountTitle || '';
              defaultAccountNumber = userData.paymentMethods.bankDetails.accountNumber || '';
              defaultBankName = userData.paymentMethods.bankDetails.bankName || '';
            }
          }
          
          setPaymentSettings({
            paymentMethod: defaultPaymentMethod,
            accountName: defaultAccountName,
            accountNumber: defaultAccountNumber,
            bankName: defaultBankName
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showErrorToast('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: value
    });
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const response = await axios.put(
        `${API_URL}/api/studio/payment-methods`,
        paymentSettings,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        showSuccessToast('Payment settings updated successfully');
        
        // Update user in context
        const updatedUserResponse = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        if (updatedUserResponse.data.user) {
          setUser(updatedUserResponse.data.user);
        }
      } else {
        showErrorToast('Failed to update payment settings');
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      showErrorToast(error.response?.data?.message || 'Error updating payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Studio Settings</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'payment'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaMoneyBillWave className="inline mr-2" />
          Payment Methods
        </button>
        
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'privacy'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaUserShield className="inline mr-2" />
          Privacy
        </button>
        
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'notifications'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaBell className="inline mr-2" />
          Notifications
        </button>
      </div>
      
      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
          <p className="text-gray-400 mb-6">
            Set up your payment methods to receive earnings from your content.
          </p>
          
          <form onSubmit={handleSavePaymentSettings}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={paymentSettings.paymentMethod}
                onChange={handlePaymentInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="jazzCash">JazzCash</option>
                <option value="easyPaisa">EasyPaisa</option>
                <option value="payFast">PayFast</option>
                <option value="bankTransfer">Bank Transfer</option>
              </select>
            </div>
            
            {paymentSettings.paymentMethod === 'bankTransfer' ? (
              <>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Account Title</label>
                  <input
                    type="text"
                    name="accountName"
                    value={paymentSettings.accountName}
                    onChange={handlePaymentInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={paymentSettings.accountNumber}
                    onChange={handlePaymentInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={paymentSettings.bankName}
                    onChange={handlePaymentInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  {paymentSettings.paymentMethod === 'jazzCash' ? 'JazzCash Number' :
                   paymentSettings.paymentMethod === 'easyPaisa' ? 'EasyPaisa Number' :
                   'PayFast Account Number'}
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={paymentSettings.accountNumber}
                  onChange={handlePaymentInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Payment Settings
                </>
              )}
            </button>
          </form>
        </div>
      )}
      
      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
          <p className="text-gray-400 mb-6">
            Manage your privacy settings and control who can see your content.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show subscriber count</h3>
                <p className="text-gray-400 text-sm">Display your subscriber count publicly on your channel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show like counts</h3>
                <p className="text-gray-400 text-sm">Display like counts on your videos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Allow comments</h3>
                <p className="text-gray-400 text-sm">Allow viewers to comment on your videos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <FaSave className="mr-2" />
            Save Privacy Settings
          </button>
        </div>
      )}
      
      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
          <p className="text-gray-400 mb-6">
            Manage your notification preferences.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email notifications</h3>
                <p className="text-gray-400 text-sm">Receive email notifications about your channel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Comment notifications</h3>
                <p className="text-gray-400 text-sm">Get notified when someone comments on your videos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Subscription notifications</h3>
                <p className="text-gray-400 text-sm">Get notified when someone subscribes to your channel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Earnings notifications</h3>
                <p className="text-gray-400 text-sm">Get notified about your earnings and payouts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <FaSave className="mr-2" />
            Save Notification Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default StudioSettings;
