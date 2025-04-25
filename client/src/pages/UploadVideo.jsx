// pages/UploadVideo.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const UploadVideo = () => {
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setError("You must be logged in to upload a video.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in to upload a video.");
      return;
    }

    if (!videoFile || !thumbnailFile || !title.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("uploader", user.name);
    formData.append("type", "video");
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnailFile);

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.post("http://localhost:5000/api/free-videos/upload-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setSuccess("🎉 Video uploaded successfully!");
      setTitle("");
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <Navbar />
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Upload a Video</h2>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {success && (
          <div className="mb-4">
            <p className="text-green-500">{success}</p>
            <Link to="/feed" className="text-blue-400 hover:underline">
              Go to Feed
            </Link>
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Thumbnail Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        ) : (
          <p className="text-gray-400">
            Please{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              log in
            </Link>{" "}
            to upload a video.
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UploadVideo;
