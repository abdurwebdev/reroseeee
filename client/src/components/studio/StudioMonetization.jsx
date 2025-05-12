import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaDollarSign, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Spinner from '../Spinner';
import WithdrawalModal from '../WithdrawalModal';
import WithdrawalHistory from '../WithdrawalHistory';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudioMonetization = () => {
  const [user] = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [monetizationData, setMonetizationData] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: 'jazzCash',
    accountName: '',
    accountNumber: '',
    additionalInfo: '',
    taxId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMonetizationData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/studio/monetization`, { withCredentials: true });

        if (response.data.success) {
          setMonetizationData(response.data.data);
        } else {
          showErrorToast('Failed to load monetization data');
        }
      } catch (error) {
        console.error('Error fetching monetization data:', error);
        showErrorToast(error.response?.data?.message || 'Error loading monetization data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMonetizationData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/studio/monetization/apply`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        showSuccessToast('Monetization application submitted successfully');
        // Refresh data
        const updatedResponse = await axios.get(`${API_URL}/api/studio/monetization`, { withCredentials: true });
        if (updatedResponse.data.success) {
          setMonetizationData(updatedResponse.data.data);
        }
        setShowApplicationForm(false);
      } else {
        showErrorToast('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showErrorToast(error.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawalComplete = async () => {
    try {
      // Refresh monetization data after withdrawal
      const response = await axios.get(`${API_URL}/api/studio/monetization`, { withCredentials: true });
      if (response.data.success) {
        setMonetizationData(response.data.data);
      }
    } catch (error) {
      console.error('Error refreshing data after withdrawal:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return <Spinner />;
  }

  const { monetizationStatus, earnings } = monetizationData;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Monetization</h1>

      {/* Monetization Status */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Monetization Status</h2>

        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-full mr-4 ${monetizationStatus.status === 'approved' ? 'bg-green-600' :
            monetizationStatus.status === 'under_review' ? 'bg-yellow-600' :
              'bg-gray-600'
            }`}>
            <FaDollarSign className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {monetizationStatus.status === 'approved' ? 'Monetization Enabled' :
                monetizationStatus.status === 'under_review' ? 'Application Under Review' :
                  monetizationStatus.status === 'rejected' ? 'Application Rejected' :
                    'Not Monetized'}
            </h3>
            <p className="text-gray-400">
              {monetizationStatus.status === 'approved' ? 'Your channel is monetized and earning revenue' :
                monetizationStatus.status === 'under_review' ? 'We are reviewing your application' :
                  monetizationStatus.status === 'rejected' ? `Reason: ${monetizationStatus.application?.rejectionReason || 'Did not meet requirements'}` :
                    monetizationStatus.isEligible ? 'Your channel is eligible for monetization' : 'Your channel does not meet the requirements yet'}
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Subscribers</span>
              {monetizationStatus.requirements.subscribers.met ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaTimesCircle className="text-red-500" />
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Required: 1,000</span>
              <span className={monetizationStatus.requirements.subscribers.met ? 'text-green-400' : 'text-gray-400'}>
                Current: {formatNumber(monetizationStatus.requirements.subscribers.current)}
              </span>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Watch Time</span>
              {monetizationStatus.requirements.watchTime.met ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaTimesCircle className="text-red-500" />
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Required: 4,000 hours</span>
              <span className={monetizationStatus.requirements.watchTime.met ? 'text-green-400' : 'text-gray-400'}>
                Current: {Math.floor(monetizationStatus.requirements.watchTime.current / 60)} hours
              </span>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Short Views</span>
              {monetizationStatus.requirements.shortViews.met ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaTimesCircle className="text-red-500" />
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Required: 10M</span>
              <span className={monetizationStatus.requirements.shortViews.met ? 'text-green-400' : 'text-gray-400'}>
                Current: {formatNumber(monetizationStatus.requirements.shortViews.current)}
              </span>
            </div>
          </div>
        </div>

        {/* Apply button */}
        {monetizationStatus.isEligible && monetizationStatus.status === 'not_eligible' && (
          <button
            onClick={() => setShowApplicationForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Apply for Monetization
          </button>
        )}
      </div>

      {/* Application Form */}
      {showApplicationForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Monetization Application</h2>

          <form onSubmit={handleSubmitApplication}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="jazzCash">JazzCash</option>
                <option value="easyPaisa">EasyPaisa</option>
                <option value="payFast">PayFast</option>
                <option value="bankTransfer">Bank Transfer</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Account Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Tax ID (Optional)</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Additional Information (Optional)</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              ></textarea>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowApplicationForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="mr-2">Submitting...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Earnings Summary */}
      {monetizationStatus.status === 'approved' &&
        monetizationStatus.requirements.subscribers.met &&
        (monetizationStatus.requirements.watchTime.met || monetizationStatus.requirements.shortViews.met) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Earnings Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaMoneyBillWave className="text-green-500 mr-2" />
                  <span>30-Day Earnings</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(earnings.summary.total.creatorTotal)}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaMoneyBillWave className="text-yellow-500 mr-2" />
                  <span>Pending Payout</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(earnings.pendingPayout)}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaMoneyBillWave className="text-blue-500 mr-2" />
                  <span>Lifetime Earnings</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(user.totalEarnings)}</p>
              </div>
            </div>

            {/* Earnings by source */}
            <h3 className="text-lg font-semibold mb-3">Earnings by Source</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-right">Earnings</th>
                    <th className="px-4 py-3 text-right">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.summary.bySource.map((source, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="px-4 py-3">
                        {source._id === 'video_view' ? 'Video Views' :
                          source._id === 'livestream_view' ? 'Livestream Views' :
                            source._id === 'ad_impression' ? 'Ad Impressions' :
                              source._id === 'ad_click' ? 'Ad Clicks' :
                                source._id === 'subscription' ? 'Subscriptions' :
                                  source._id}
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(source.creatorEarnings)}</td>
                      <td className="px-4 py-3 text-right">{source.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payout button */}
            {earnings.pendingPayout >= earnings.settings.minimumPayoutAmount && (
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Request Withdrawal ({formatCurrency(earnings.pendingPayout)})
              </button>
            )}

            {earnings.pendingPayout < earnings.settings.minimumPayoutAmount && (
              <p className="text-gray-400">
                Minimum payout amount: {formatCurrency(earnings.settings.minimumPayoutAmount)}
              </p>
            )}

            {/* Withdrawal History */}
            <WithdrawalHistory />
          </div>
        )}

      {/* Message when monetization is approved but requirements not met */}
      {monetizationStatus.status === 'approved' &&
        (!monetizationStatus.requirements.subscribers.met ||
          (!monetizationStatus.requirements.watchTime.met && !monetizationStatus.requirements.shortViews.met)) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Earnings</h2>
            <div className="p-4 bg-gray-900 rounded-lg">
              <p className="text-lg mb-2">Your earnings will be displayed once you meet the following requirements:</p>
              <ul className="list-disc pl-5 space-y-2">
                {!monetizationStatus.requirements.subscribers.met && (
                  <li>At least 1,000 subscribers (Current: {formatNumber(monetizationStatus.requirements.subscribers.current)})</li>
                )}
                {!monetizationStatus.requirements.watchTime.met && !monetizationStatus.requirements.shortViews.met && (
                  <li>Either 4,000 hours of watch time (Current: {Math.floor(monetizationStatus.requirements.watchTime.current / 60)} hours) or 10M short views (Current: {formatNumber(monetizationStatus.requirements.shortViews.current)})</li>
                )}
              </ul>
            </div>
          </div>
        )}

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        pendingAmount={monetizationData?.earnings?.pendingPayout || 0}
        onWithdrawalComplete={handleWithdrawalComplete}
      />
    </div>
  );
};

export default StudioMonetization;
