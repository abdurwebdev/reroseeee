import React, { useState } from 'react';
import { FaMoneyBillWave, FaMobileAlt, FaCreditCard, FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PaymentModal = ({ isOpen, onClose, course }) => {
  const [selectedGateway, setSelectedGateway] = useState('jazzCash');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  console.log("PaymentModal rendered with props:", { isOpen, course });

  if (!isOpen || !course) {
    console.log("PaymentModal not showing because:", { isOpen, hasCourse: !!course });
    return null;
  }

  const handleSelectGateway = (gateway) => {
    setSelectedGateway(gateway);
  };

  const handlePurchase = async () => {
    if (!selectedGateway) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    try {
      // For testing purposes, we'll directly process the course purchase
      // without going through the actual payment gateway
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add course to user's purchased courses
      await axios.post(
        `${API_URL}/api/student/purchase-course/${course._id}`,
        {},
        { withCredentials: true }
      );

      toast.success("Course purchased successfully!");

      // Redirect to course videos page
      navigate(`/course-videos/${course._id}`);
    } catch (error) {
      console.error("Error processing payment:", error);

      if (error.response?.status === 401) {
        toast.error("Please login to purchase this course");
        navigate("/login");
      } else if (error.response?.status === 400 && error.response.data.message === "Course already purchased") {
        toast.info("You've already purchased this course");
        navigate(`/course-videos/${course._id}`);
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="flex items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <FaMoneyBillWave className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold">Payment</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-2">Amount to Pay:</p>
          <p className="text-3xl font-bold text-green-500">₹ {course?.price}</p>
          <p className="text-gray-400 mt-1">Purchase of course: {course?.title}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-2">Select Payment Method:</p>
          <div className="grid grid-cols-1 gap-3">
            <div
              className={`p-3 border rounded-lg cursor-pointer flex items-center ${selectedGateway === 'jazzCash' ? 'border-red-500 bg-red-900 bg-opacity-20' : 'border-gray-700'}`}
              onClick={() => handleSelectGateway('jazzCash')}
            >
              <FaMobileAlt className="text-red-500 text-xl mr-3" />
              <div>
                <h4 className="font-medium">JazzCash</h4>
                <p className="text-sm text-gray-400">Mobile payment service</p>
              </div>
              <input
                type="radio"
                className="ml-auto"
                checked={selectedGateway === 'jazzCash'}
                onChange={() => handleSelectGateway('jazzCash')}
              />
            </div>

            <div
              className={`p-3 border rounded-lg cursor-pointer flex items-center ${selectedGateway === 'easyPaisa' ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
              onClick={() => handleSelectGateway('easyPaisa')}
            >
              <FaMobileAlt className="text-green-500 text-xl mr-3" />
              <div>
                <h4 className="font-medium">EasyPaisa</h4>
                <p className="text-sm text-gray-400">Mobile payment service</p>
              </div>
              <input
                type="radio"
                className="ml-auto"
                checked={selectedGateway === 'easyPaisa'}
                onChange={() => handleSelectGateway('easyPaisa')}
              />
            </div>

            <div
              className={`p-3 border rounded-lg cursor-pointer flex items-center ${selectedGateway === 'payFast' ? 'border-blue-500 bg-blue-900 bg-opacity-20' : 'border-gray-700'}`}
              onClick={() => handleSelectGateway('payFast')}
            >
              <FaCreditCard className="text-blue-500 text-xl mr-3" />
              <div>
                <h4 className="font-medium">PayFast</h4>
                <p className="text-sm text-gray-400">Credit/debit card payments</p>
              </div>
              <input
                type="radio"
                className="ml-auto"
                checked={selectedGateway === 'payFast'}
                onChange={() => handleSelectGateway('payFast')}
              />
            </div>

            <div
              className={`p-3 border rounded-lg cursor-pointer flex items-center ${selectedGateway === 'bankTransfer' ? 'border-gray-400 bg-gray-800' : 'border-gray-700'}`}
              onClick={() => handleSelectGateway('bankTransfer')}
            >
              <FaUniversity className="text-gray-400 text-xl mr-3" />
              <div>
                <h4 className="font-medium">Bank Transfer</h4>
                <p className="text-sm text-gray-400">Direct bank transfer</p>
              </div>
              <input
                type="radio"
                className="ml-auto"
                checked={selectedGateway === 'bankTransfer'}
                onChange={() => handleSelectGateway('bankTransfer')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className={`${isProcessing ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded flex items-center`}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
