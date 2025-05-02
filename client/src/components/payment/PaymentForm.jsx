import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaUniversity, FaSpinner } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const API_URL = "http://localhost:5000";

const PaymentForm = ({ amount, purpose, referenceId, referenceModel, description, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('jazzCash');
  const [formData, setFormData] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [iframeHeight, setIframeHeight] = useState('600px');
  const navigate = useNavigate();

  const paymentGateways = [
    { id: 'jazzCash', name: 'JazzCash', icon: <FaMobileAlt className="text-red-500" /> },
    { id: 'easyPaisa', name: 'EasyPaisa', icon: <FaMobileAlt className="text-green-500" /> },
    { id: 'payFast', name: 'PayFast', icon: <FaCreditCard className="text-blue-500" /> },
    { id: 'bankTransfer', name: 'Bank Transfer', icon: <FaUniversity className="text-gray-500" /> }
  ];

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/api/payments/initialize`,
        {
          gateway: selectedGateway,
          amount,
          purpose,
          referenceId,
          referenceModel,
          description
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        if (selectedGateway === 'bankTransfer') {
          // For bank transfer, show instructions
          showSuccessToast('Bank transfer instructions have been sent to your email');
          if (onSuccess) {
            onSuccess(response.data.data.paymentId);
          }
        } else {
          // For other gateways, show payment form
          setFormData(response.data.data.formData);
          setPaymentUrl(response.data.data.paymentUrl);
          setShowIframe(true);
          
          // Store payment ID in localStorage for later verification
          localStorage.setItem('pendingPaymentId', response.data.data.paymentId);
        }
      } else {
        showErrorToast('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      showErrorToast(error.response?.data?.message || 'Error initializing payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowIframe(false);
    if (onCancel) {
      onCancel();
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Create a form and submit it programmatically
  useEffect(() => {
    if (formData && paymentUrl) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;
      form.target = 'paymentIframe';
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // Append form to body, submit it, and remove it
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
  }, [formData, paymentUrl]);

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-auto">
      {!showIframe ? (
        <>
          <div className="flex items-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold">Payment</h2>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Amount to Pay:</p>
            <p className="text-3xl font-bold text-green-500">{formatCurrency(amount)}</p>
            {description && <p className="text-gray-400 mt-1">{description}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-3">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentGateways.map(gateway => (
                <div
                  key={gateway.id}
                  className={`p-4 rounded-lg cursor-pointer flex flex-col items-center ${
                    selectedGateway === gateway.id ? 'bg-blue-900 border border-blue-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedGateway(gateway.id)}
                >
                  <div className="text-2xl mb-2">{gateway.icon}</div>
                  <span>{gateway.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePayment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>Pay Now</>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Complete Your Payment</h2>
          <div className="bg-gray-800 p-2 rounded-lg mb-4">
            <iframe
              name="paymentIframe"
              title="Payment Gateway"
              className="w-full"
              height={iframeHeight}
              frameBorder="0"
            ></iframe>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
