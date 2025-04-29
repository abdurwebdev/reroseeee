import React, { useState } from 'react';
import axios from 'axios';

const CreateLivestreamForm = ({ onStreamCreated }) => {
  const [name, setName] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/livestream/create',
        { name, isScreenSharing },
        { withCredentials: true }
      );

      setLoading(false);

      if (onStreamCreated && response.data.success) {
        onStreamCreated(response.data.data);
      }

      // Reset form
      setName('');
      setIsScreenSharing(false);
    } catch (err) {
      setLoading(false);

      // Check if this is a plan limitation error
      if (err.response?.status === 403 &&
        err.response?.data?.error?.includes('plan')) {
        setError('Livestreaming is not available on the Cloudinary free plan. Please upgrade to a paid plan.');
      } else {
        setError(err.response?.data?.error || 'Failed to create livestream');
      }

      console.error('Error creating livestream:', err);
    }
  };

  return (
    <div className="bg-[#111111] p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">Create New Livestream</h2>

      <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-md">
        <h3 className="text-red-300 font-bold text-lg mb-2">⚠️ Cloudinary Plan Limitation</h3>
        <p className="text-red-200">
          Livestreaming is not available on the Cloudinary free plan. You will need to upgrade to a paid Cloudinary plan to use this feature.
        </p>
        <a
          href="https://cloudinary.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition"
        >
          View Cloudinary Pricing
        </a>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-300 mb-2">
            Stream Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2"
            placeholder="My Awesome Stream"
            required
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={isScreenSharing}
              onChange={(e) => setIsScreenSharing(e.target.checked)}
              className="mr-2"
            />
            Screen Sharing Stream
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md ${loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium`}
        >
          {loading ? 'Creating...' : 'Create Livestream'}
        </button>

        <p className="text-gray-400 text-sm mt-2 text-center">
          Note: This form will work once you upgrade to a paid Cloudinary plan
        </p>
      </form>
    </div>
  );
};

export default CreateLivestreamForm;
