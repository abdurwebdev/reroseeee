import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LivestreamList from "../components/LivestreamList";

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [activeLivestreams, setActiveLivestreams] = useState([]);
  const [endedLivestreams, setEndedLivestreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🆕 Search term

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const fetchVideos = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/free-videos/feed", {
          withCredentials: true,
        });
        console.log(res.data); // Check what data is returned, especially the URL
        const allVideos = res.data;
        setVideos(allVideos.filter((video) => video.type === "video"));
        setShorts(allVideos.filter((video) => video.type === "short"));
        if (storedUser) {
          setUserVideos(
            allVideos.filter((video) => video.uploader === storedUser.name)
          );
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch videos");
        setLoading(false);
      }
    };

    // Fetch active livestreams
    const fetchLivestreams = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/livestream/active");
        setActiveLivestreams(res.data.data || []);

        // Also fetch ended livestreams
        const endedRes = await axios.get("http://localhost:5000/api/livestream/ended");
        setEndedLivestreams(endedRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch livestreams:", err);
        // Don't set the main error state, as we still want to show videos
      }
    };

    fetchVideos();
    fetchLivestreams();
  }, []);

  // 🧠 Filtering logic
  const filterVideos = (list) =>
    list.filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <div className="text-center text-xl mt-10 text-gray-300">Loading...</div>;
  if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#000000] text-white p-4">
      <Navbar />
      <div className="container mx-auto">
        {user && (
          <div className="flex items-center justify-center mb-6">
            {user.profileImageUrl && (
              <img
                src={`http://localhost:5000${user.profileImageUrl}`}
                alt="Profile"
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-100">
              Welcome, {user.name}!
            </h1>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-center">Free Video Feed</h1>

        {/* 🆕 Search bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-lg px-4 py-2 rounded-lg text-black bg-white outline-none"
          />
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Link to="/upload-video" className="px-4 py-2 bg-[#111111] text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
            Upload Video
          </Link>
          <Link to="/upload-short" className="px-4 py-2 bg-[#111111] text-gray-200 rounded-lg hover:bg-gray-600 transition-colors">
            Upload Short
          </Link>
          <Link to="/live-course" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Go Live
          </Link>
        </div>

        {/* Active Livestreams Section */}
        {activeLivestreams.length > 0 && (
          <LivestreamList
            livestreams={activeLivestreams}
            title="Live Now"
            emptyMessage="No active livestreams at the moment."
            linkTo="/watch-livestream"
          />
        )}

        {user && filterVideos(userVideos).length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Your Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filterVideos(userVideos).map((video) => (
                <Link to={`/watch/${video._id}`} key={video._id} className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" />
                  <div className="p-3">
                    <h3 className="text-md font-semibold text-gray-100 truncate">{video.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{video.uploader} • {video.views} views</p>
                  </div>
                </Link>


              ))}
            </div>
          </>
        )}

        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filterVideos(videos).map((video) => (
            <Link to={`/watch/${video._id}`} key={video._id} className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200">
              <img src={`${video.thumbnailUrl}`} alt={video.title} className="w-full h-48 object-cover" />
              <div className="p-3">
                <h3 className="text-md font-semibold text-gray-100 truncate">{video.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{video.uploader} • {video.views} views</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Shorts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filterVideos(shorts).map((short) => (
            <Link to={`/watch/${short._id}`} key={short._id} className="block rounded-lg overflow-hidden bg-[#111111] hover:bg-gray-700 transition-colors duration-200">
              <img src={`http://localhost:5000${short.thumbnailUrl}`} alt={short.title} className="w-full h-48 object-cover" />
              <div className="p-3">
                <h3 className="text-md font-semibold text-gray-100 truncate">{short.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{short.uploader} • {short.views} views</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Ended Livestreams Section */}
        {endedLivestreams.length > 0 && (
          <LivestreamList
            livestreams={endedLivestreams}
            title="Recent Livestreams"
            emptyMessage="No recent livestreams available."
            linkTo="/watch-livestream"
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Feed;
