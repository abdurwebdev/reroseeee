import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaCheckCircle, FaArrowLeft, FaHome } from 'react-icons/fa';
import { showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const PaymentSuccess = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Get payment ID from URL query params
        const params = new URLSearchParams(location.search);
        const paymentId = params.get('paymentId') || localStorage.getItem('pendingPaymentId');

        if (!paymentId) {
          // If no payment ID but courseId is provided, this is a course payment
          if (courseId) {
            setLoading(false);
            return;
          }

          navigate('/');
          return;
        }

        setLoading(true);

        const response = await axios.get(`${API_URL}/api/payments/details/${paymentId}`, {
          withCredentials: true
        });

        if (response.data.success) {
          setPayment(response.data.data.payment);

          // Clear pending payment ID from localStorage
          localStorage.removeItem('pendingPaymentId');
        } else {
          showErrorToast('Failed to load payment details');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        showErrorToast('Error loading payment details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [navigate, location.search, courseId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPurposeLabel = (purpose) => {
    switch (purpose) {
      case 'subscription':
        return 'Channel Subscription';
      case 'donation':
        return 'Creator Donation';
      case 'premium':
        return 'Premium Subscription';
      case 'adCredit':
        return 'Advertising Credit';
      case 'course':
        return 'Course Purchase';
      default:
        return 'Payment';
    }
  };

  const getPaymentMethodLabel = (gateway) => {
    switch (gateway) {
      case 'jazzCash':
        return 'JazzCash';
      case 'easyPaisa':
        return 'EasyPaisa';
      case 'payFast':
        return 'PayFast';
      case 'bankTransfer':
        return 'Bank Transfer';
      default:
        return gateway;
    }
  };

  const getRedirectPath = () => {
    if (courseId) {
      return `/course-videos/${courseId}`;
    }

    if (!payment) return '/';

    switch (payment.purpose) {
      case 'subscription':
        return `/channel/${payment.referenceId}`;
      case 'premium':
        return '/premium';
      case 'adCredit':
        return '/studio/ads';
      case 'course':
        return `/course-videos/${payment.referenceId}`;
      default:
        return '/';
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Course payment success (legacy support)
  if (courseId && !payment) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold">Payment Successful!</h1>
        <p className="text-lg mt-4">Thank you for purchasing the course.</p>
        <p className="text-lg mt-4">You can now access the course videos and start learning!</p>
        <Link to={`/course-videos/${courseId}`} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          Go to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="bg-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-400 text-4xl" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-300 mb-8">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-left">Payment Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-gray-400 text-sm">Transaction ID</p>
                <p className="font-medium">{payment.transactionId || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="font-medium">{formatDate(payment.createdAt)}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="font-medium text-green-500">{formatCurrency(payment.amount)}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Payment Method</p>
                <p className="font-medium">{getPaymentMethodLabel(payment.gateway)}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Purpose</p>
                <p className="font-medium">{getPurposeLabel(payment.purpose)}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="font-medium text-green-500">Completed</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/payment/history')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Payment History
            </button>

            <button
              onClick={() => navigate(getRedirectPath())}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
            >
              <FaHome className="mr-2" /> Continue
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
