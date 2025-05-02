import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaPaperPlane, FaSmile, FaMeh, FaFrown, FaThumbsUp, FaBug, FaLightbulb, FaQuestion } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const API_URL = "http://localhost:5000";

const Feedback = () => {
  const [user, setUser] = useState(null);
  const [feedbackType, setFeedbackType] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (storedUser) {
      setUser(storedUser);
      setEmail(storedUser.email || '');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackType) {
      showErrorToast('Please select a feedback type');
      return;
    }
    
    if (!satisfaction) {
      showErrorToast('Please select your satisfaction level');
      return;
    }
    
    if (!feedbackText.trim()) {
      showErrorToast('Please provide some feedback details');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await axios.post(`${API_URL}/api/feedback`, {
        userId: user?._id,
        feedbackType,
        satisfaction,
        feedbackText,
        email: email || undefined
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        showSuccessToast('Thank you for your feedback!');
        setSubmitted(true);
        
        // Reset form
        setFeedbackType('');
        setSatisfaction('');
        setFeedbackText('');
      } else {
        showErrorToast('Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      showErrorToast(err.response?.data?.message || 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackTypes = [
    { id: 'general', label: 'General Feedback', icon: <FaThumbsUp className="text-blue-500" /> },
    { id: 'bug', label: 'Report a Bug', icon: <FaBug className="text-red-500" /> },
    { id: 'feature', label: 'Feature Request', icon: <FaLightbulb className="text-yellow-500" /> },
    { id: 'question', label: 'Question', icon: <FaQuestion className="text-purple-500" /> }
  ];

  const satisfactionLevels = [
    { id: 'satisfied', label: 'Satisfied', icon: <FaSmile className="text-green-500 text-2xl" /> },
    { id: 'neutral', label: 'Neutral', icon: <FaMeh className="text-yellow-500 text-2xl" /> },
    { id: 'unsatisfied', label: 'Unsatisfied', icon: <FaFrown className="text-red-500 text-2xl" /> }
  ];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Send Feedback</h1>
        
        {submitted ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FaThumbsUp className="text-green-400 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Thank You for Your Feedback!</h2>
            <p className="text-gray-400 mb-6">
              We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve our platform.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSubmitted(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Send More Feedback
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-300 mb-3">What type of feedback do you have?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feedbackTypes.map(type => (
                    <div
                      key={type.id}
                      className={`p-4 rounded-lg cursor-pointer flex items-center ${
                        feedbackType === type.id ? 'bg-blue-900 border border-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => setFeedbackType(type.id)}
                    >
                      <div className="mr-3">{type.icon}</div>
                      <span>{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-3">How satisfied are you with our platform?</label>
                <div className="flex flex-wrap justify-center gap-4">
                  {satisfactionLevels.map(level => (
                    <div
                      key={level.id}
                      className={`p-4 rounded-lg cursor-pointer flex flex-col items-center ${
                        satisfaction === level.id ? 'bg-blue-900 border border-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => setSatisfaction(level.id)}
                    >
                      <div className="mb-2">{level.icon}</div>
                      <span>{level.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Tell us more</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  placeholder="Please provide details about your feedback, suggestions, or the issue you're experiencing..."
                  required
                ></textarea>
              </div>
              
              {!user && (
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email if you'd like us to follow up with you"
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
                  disabled={submitting}
                >
                  <FaPaperPlane className="mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h2>
          <p className="text-gray-300 mb-4">
            If you need immediate assistance or have specific questions, you can also reach us through these channels:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Help Center</h3>
              <p className="text-sm text-gray-400">
                Browse our comprehensive help articles and tutorials for answers to common questions.
              </p>
              <button
                onClick={() => navigate('/help')}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                Visit Help Center
              </button>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Support Email</h3>
              <p className="text-sm text-gray-400">
                For urgent issues or complex inquiries, contact our support team directly via email.
              </p>
              <a
                href="mailto:support@example.com"
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                support@example.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Feedback;
