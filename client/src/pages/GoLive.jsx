import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CreateLivestreamForm from '../components/CreateLivestreamForm';
import LivestreamDetails from '../components/LivestreamDetails';
import { showSuccessToast, showErrorToast, showInfoToast } from "../utils/toast";

const GoLive = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myLivestreams, setMyLivestreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(storedUser);

    // Fetch user's livestreams
    const fetchMyLivestreams = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/livestream', {
          withCredentials: true
        });

        if (response.data.success) {
          // Filter to only show the user's own livestreams
          const userStreams = response.data.data.filter(
            stream => stream.user._id === storedUser._id
          );
          setMyLivestreams(userStreams);

          // If there are active streams, select the first one
          const activeStream = userStreams.find(stream => stream.status === 'active');
          if (activeStream) {
            setSelectedStream(activeStream);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching livestreams:', err);
        setError('Failed to load your livestreams');
        setLoading(false);
      }
    };

    fetchMyLivestreams();
  }, [navigate]);

  const handleStreamCreated = (newStream) => {
    setMyLivestreams(prev => [newStream, ...prev]);
    setSelectedStream(newStream);
    showSuccessToast("Livestream created successfully!");
  };

  const handleStatusChange = (updatedStream, isDeleted = false) => {
    if (isDeleted) {
      // Remove the stream from the list
      setMyLivestreams(prev => prev.filter(stream => stream._id !== selectedStream._id));
      setSelectedStream(null);
      showSuccessToast("Livestream deleted successfully");
    } else {
      // Update the stream in the list
      setMyLivestreams(prev =>
        prev.map(stream =>
          stream._id === updatedStream._id ? updatedStream : stream
        )
      );
      setSelectedStream(updatedStream);

      // Show appropriate toast based on status
      if (updatedStream.status === 'active') {
        showSuccessToast("Livestream activated successfully");
      } else if (updatedStream.endedAt) {
        showInfoToast("Livestream ended");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Go Live</h1>
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Go Live</h1>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Create Stream Form */}
          <div className="lg:col-span-1">
            <CreateLivestreamForm onStreamCreated={handleStreamCreated} />

            {/* My Livestreams List */}
            <div className="mt-6 bg-[#111111] p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-white">My Livestreams</h2>

              {myLivestreams.length === 0 ? (
                <p className="text-gray-400">You haven't created any livestreams yet.</p>
              ) : (
                <div className="space-y-3">
                  {myLivestreams.map(stream => (
                    <div
                      key={stream._id}
                      onClick={() => setSelectedStream(stream)}
                      className={`p-3 rounded-md cursor-pointer ${selectedStream && selectedStream._id === stream._id
                        ? 'bg-blue-900'
                        : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">{stream.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${stream.status === 'active'
                          ? 'bg-green-600 text-white'
                          : stream.endedAt
                            ? 'bg-gray-600 text-white'
                            : 'bg-yellow-600 text-white'
                          }`}>
                          {stream.status === 'active'
                            ? 'Live'
                            : stream.endedAt
                              ? 'Ended'
                              : 'Idle'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {stream.isScreenSharing ? 'Screen Sharing' : 'Video Stream'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stream Details */}
          <div className="lg:col-span-2">
            {selectedStream ? (
              <LivestreamDetails
                livestream={selectedStream}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <div className="bg-[#111111] p-6 rounded-lg shadow-md flex items-center justify-center h-64">
                <p className="text-gray-400 text-center">
                  Select a livestream from the list or create a new one to get started.
                </p>
              </div>
            )}

            {/* OBS Instructions */}
            <div className="mt-6 bg-[#111111] p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-white">How to Stream with OBS Studio</h2>

              <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-md">
                <h3 className="text-red-300 font-bold text-lg mb-2">⚠️ Cloudinary Plan Limitation</h3>
                <p className="text-red-200">
                  <strong>Important:</strong> Livestreaming is not available on the Cloudinary free plan.
                  You will need to upgrade to a paid Cloudinary plan to use this feature.
                </p>
                <p className="text-red-200 mt-2">
                  The error "Error creating livestream" occurs because the Cloudinary API restricts livestreaming
                  functionality to paid plans only.
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

              <p className="text-gray-300 mb-4">Once you've upgraded your Cloudinary plan, follow these steps:</p>

              <ol className="list-decimal list-inside space-y-3 text-gray-300">
                <li>Download and install <a href="https://obsproject.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OBS Studio</a></li>
                <li>Open OBS Studio and go to Settings &gt; Stream</li>
                <li>Select "Custom..." as the service</li>
                <li>Copy the RTMP URL from your selected livestream and paste it into the "Server" field</li>
                <li>Copy the Stream Key and paste it into the "Stream Key" field</li>
                <li>Click "OK" to save settings</li>
                <li>Set up your scenes and sources (camera, microphone, screen capture, etc.)</li>
                <li>Click "Start Streaming" to begin your livestream</li>
              </ol>

              <div className="mt-4 p-3 bg-yellow-800 bg-opacity-30 border border-yellow-700 rounded-md">
                <p className="text-yellow-300 text-sm">
                  <strong>Note:</strong> Even on paid plans, Cloudinary has limitations on bandwidth and streaming duration.
                  Check your plan details for specific limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GoLive;