import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaTimesCircle, FaArrowLeft, FaHome } from 'react-icons/fa';

const PaymentError = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get error message from URL query params
    const params = new URLSearchParams(location.search);
    const message = params.get('message') || 'An error occurred during payment processing';
    setErrorMessage(message);
    
    // Clear any pending payment ID from localStorage
    localStorage.removeItem('pendingPaymentId');
  }, [location.search]);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="bg-red-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="text-red-400 text-4xl" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-gray-300 mb-8">
            {errorMessage}
          </p>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">What went wrong?</h2>
            <p className="text-gray-300 mb-4">
              Your payment could not be processed due to one of the following reasons:
            </p>
            <ul className="text-left text-gray-300 space-y-2 mb-4">
              <li>• Insufficient funds in your account</li>
              <li>• Payment was declined by your bank or payment provider</li>
              <li>• Connection issues during the payment process</li>
              <li>• Incorrect payment details were entered</li>
              <li>• The payment session timed out</li>
            </ul>
            <p className="text-gray-300">
              You can try again with the same or a different payment method.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
            >
              <FaHome className="mr-2" /> Home
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentError;
