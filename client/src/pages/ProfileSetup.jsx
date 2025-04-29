import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { showSuccessToast, showErrorToast, showWarningToast } from "../utils/toast";

const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in and prefill name if available
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login"); // Redirect to login if not logged in
    } else {
      setName(storedUser.name || ""); // Prefill name if it exists
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!name) {
      setError("Name is required");
      showWarningToast("Name is required");
      setLoading(false);
      return;
    }

    // At least require profile image for initial setup
    if (!profileImage && !imagePreview) {
      setError("Profile image is required");
      showWarningToast("Profile image is required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      // Update localStorage with new user data including profileImageUrl
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully!");
      showSuccessToast("Profile updated successfully! Redirecting to your dashboard...");

      // Determine where to redirect based on user role
      const userRole = updatedUser.role || "student";

      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admindashboard");
        } else if (userRole === "creator") {
          navigate("/feed");
        } else {
          navigate("/feed"); // Default for students
        }
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex pt-20 items-center justify-center min-h-screen bg-black flex-col text-white">
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-lg shadow-lg w-96 border border-gray-700"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Setup Your Profile</h2>
          {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
          {success && <p className="text-green-400 mb-4 text-center">{success}</p>}

          {/* Profile Image Preview */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden"
                style={imagePreview ? { backgroundImage: `url(${imagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {!imagePreview && (
                  <span className="text-gray-400 text-5xl">👤</span>
                )}
              </div>
              <label
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 rounded-full p-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-600 bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" // Hide the actual input
            />
            <label
              htmlFor="profile-image-upload"
              className="w-full block text-center p-3 border border-dashed border-gray-500 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors"
            >
              {profileImage ? profileImage.name : "Select profile image"}
            </label>
          </div>

          <button
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition-all duration-300 ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
        <Footer />
      </div>
    </>
  );
};

export default ProfileSetup;