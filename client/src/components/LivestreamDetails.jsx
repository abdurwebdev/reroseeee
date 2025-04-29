import React, { useState } from 'react';
import axios from 'axios';
import LivestreamPlayer from './LivestreamPlayer';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const LivestreamDetails = ({ livestream, onStatusChange }) => {
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleActivate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/livestream/${livestream._id}/activate`,
        {},
        { withCredentials: true }
      );

      setLoading(false);

      if (onStatusChange && response.data.success) {
        onStatusChange(response.data.data);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 'Failed to activate livestream';
      setError(errorMessage);
      showErrorToast(errorMessage);
      console.error('Error activating livestream:', err);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/livestream/${livestream._id}/deactivate`,
        {},
        { withCredentials: true }
      );

      setLoading(false);

      if (onStatusChange && response.data.success) {
        onStatusChange(response.data.data);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 'Failed to deactivate livestream';
      setError(errorMessage);
      showErrorToast(errorMessage);
      console.error('Error deactivating livestream:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this livestream?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.delete(
        `http://localhost:5000/api/livestream/${livestream._id}`,
        { withCredentials: true }
      );

      setLoading(false);

      if (onStatusChange) {
        onStatusChange(null, true); // Indicate deletion
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || 'Failed to delete livestream';
      setError(errorMessage);
      showErrorToast(errorMessage);
      console.error('Error deleting livestream:', err);
    }
  };

  const copyToClipboard = (text, label = 'Text') => {
    navigator.clipboard.writeText(text);
    showSuccessToast(`${label} copied to clipboard!`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-[#111111] rounded-lg shadow-md overflow-hidden">
      {/* Stream Status Banner */}
      <div className={`p-2 text-center text-white font-medium ${livestream.status === 'active'
        ? 'bg-green-600'
        : livestream.status === 'idle' && livestream.endedAt
          ? 'bg-gray-600'
          : 'bg-yellow-600'
        }`}>
        {livestream.status === 'active'
          ? 'LIVE NOW'
          : livestream.status === 'idle' && livestream.endedAt
            ? 'ENDED'
            : 'IDLE'
        }
      </div>

      {/* Video Player (if active) */}
      {livestream.status === 'active' && (
        <div className="w-full">
          <LivestreamPlayer playbackUrl={livestream.playbackUrl} />
        </div>
      )}

      {/* Stream Info */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-2">{livestream.name}</h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-4">
          <p className="text-gray-300">
            <span className="font-medium">Status:</span>{' '}
            <span className={`${livestream.status === 'active'
              ? 'text-green-500'
              : livestream.status === 'idle' && livestream.endedAt
                ? 'text-gray-500'
                : 'text-yellow-500'
              }`}>
              {livestream.status === 'active'
                ? 'Live'
                : livestream.status === 'idle' && livestream.endedAt
                  ? 'Ended'
                  : 'Idle'
              }
            </span>
          </p>

          <p className="text-gray-300">
            <span className="font-medium">Type:</span>{' '}
            {livestream.isScreenSharing ? 'Screen Sharing' : 'Video Stream'}
          </p>

          {livestream.startedAt && (
            <p className="text-gray-300">
              <span className="font-medium">Started:</span> {formatDate(livestream.startedAt)}
            </p>
          )}

          {livestream.endedAt && (
            <p className="text-gray-300">
              <span className="font-medium">Ended:</span> {formatDate(livestream.endedAt)}
            </p>
          )}
        </div>

        {/* RTMP Info (only if not ended) */}
        {(!livestream.endedAt || livestream.status === 'active') && (
          <div className="mb-4 p-3 bg-gray-800 rounded-md">
            <h3 className="text-white font-medium mb-2">Stream Information</h3>

            <div className="mb-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">RTMP URL:</span>
                <button
                  onClick={() => copyToClipboard(livestream.rtmpUrl, 'RTMP URL')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-900 p-2 rounded text-gray-300 text-sm break-all">
                {livestream.rtmpUrl}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Stream Key:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowStreamKey(!showStreamKey)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {showStreamKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(livestream.streamKey, 'Stream Key')}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded text-gray-300 text-sm break-all">
                {showStreamKey ? livestream.streamKey : '••••••••••••••••••••••••••'}
              </div>
            </div>
          </div>
        )}

        {/* Playback URL */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Playback URL:</span>
            <button
              onClick={() => copyToClipboard(livestream.playbackUrl, 'Playback URL')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-900 p-2 rounded text-gray-300 text-sm break-all">
            {livestream.playbackUrl}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {livestream.status !== 'active' && !livestream.endedAt && (
            <button
              onClick={handleActivate}
              disabled={loading}
              className={`px-4 py-2 rounded-md ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } text-white`}
            >
              Activate Stream
            </button>
          )}

          {livestream.status === 'active' && (
            <button
              onClick={handleDeactivate}
              disabled={loading}
              className={`px-4 py-2 rounded-md ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                } text-white`}
            >
              End Stream
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={loading}
            className={`px-4 py-2 rounded-md ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'
              } text-white`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default LivestreamDetails;
