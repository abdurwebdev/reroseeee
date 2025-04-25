// pages/UploadShort.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UploadShort = () => {
  const [title, setTitle] = useState("");
  const [uploader, setUploader] = useState(""); // Will store the logged-in user's name
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch the logged-in user's data from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUploader(storedUser.name); // Set uploader's name to the logged-in user's name
    } else {
      setError("You must be logged in to upload a short.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!title || !videoFile || !thumbnailFile) {
      setError("Please fill out all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("uploader", uploader);
    formData.append("type", "short"); // Set type to short
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnailFile);

    try {
      await axios.post("http://localhost:5000/api/free-videos/upload-short", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Short uploaded successfully!");
      setError(null);
      setTitle("");
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (err) {
      setError("Error uploading short");
      setSuccess(null);
    }
  };

  return (
    <div className="w-full h-screen bg-black">
      <Navbar />
      <div className="container text-white mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Upload a Short</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && (
          <div className="mb-4">
            <p className="text-green-500">{success}</p>
            <Link to="/feed" className="text-blue-500 hover:underline">
              Go to Feed
            </Link>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Username</label>
            <input
              type="text"
              value={uploader} // Automatically filled with logged-in user's name
              readOnly // Make it read-only as it's auto-filled
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Short Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Upload Short
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default UploadShort;
