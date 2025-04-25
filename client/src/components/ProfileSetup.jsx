import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaUser, FaCamera, FaUpload } from "react-icons/fa";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    bio: "",
    location: "",
    website: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          withCredentials: true,
        });
        setUser(res.data);
        // Pre-fill form with existing user data
        setFormData({
          name: res.data.name || "",
          displayName: res.data.displayName || "",
          bio: res.data.bio || "",
          location: res.data.location || "",
          website: res.data.website || "",
        });
        
        if (res.data.profileImageUrl) {
          setProfilePreview(`http://localhost:5000${res.data.profileImageUrl}`);
        }
        
        if (res.data.bannerImageUrl) {
          setBannerPreview(`http://localhost:5000${res.data.bannerImageUrl}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setLoading(false);
        setError("You must be logged in to setup your profile.");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create preview
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      // Create preview
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Create form data for sending files
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Add files if selected
      if (profileImage) {
        submitData.append("profileImage", profileImage);
      }
      
      if (bannerImage) {
        submitData.append("bannerImage", bannerImage);
      }

      // Send to server
      const response = await axios.post(
        "http://localhost:5000/api/users/update-profile",
        submitData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update local storage user data
      if (localStorage.getItem("user")) {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const updatedUser = { ...storedUser, ...response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      alert("Profile updated successfully!");
      navigate("/feed"); // Redirect to feed or dashboard
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-xl">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-xl">{error}</p>
            <p className="mt-2">Redirecting to login...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-center mb-8">
            {user?.profileImageUrl ? "Update Your Profile" : "Complete Your Profile"}
          </h1>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Image */}
            <div className="relative">
              <div 
                className={`w-full h-40 rounded-lg flex items-center justify-center ${
                  bannerPreview ? "bg-gray-900" : "bg-gray-800"
                }`}
                style={bannerPreview ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {!bannerPreview && (
                  <div className="text-center">
                    <FaUpload className="mx-auto text-2xl text-gray-400" />
                    <p className="text-gray-400 mt-2">Upload a banner image (optional)</p>
                  </div>
                )}

                <label className="absolute bottom-2 right-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-full cursor-pointer">
                  <FaCamera className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Profile Image */}
            <div className="flex justify-center -mt-12">
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full border-4 border-black overflow-hidden bg-gray-700 flex items-center justify-center"
                  style={profilePreview ? { backgroundImage: `url(${profilePreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!profilePreview && <FaUser className="text-4xl text-gray-400" />}
                </div>
                <label className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 p-2 rounded-full cursor-pointer">
                  <FaCamera className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Full Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Display/Channel Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How you want to be known"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-gray-400 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell viewers about yourself"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Website/Social</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Updating..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfileSetup;