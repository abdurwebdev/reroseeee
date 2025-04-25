import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminVideoDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false); // Added for deletion UX
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Added environment variable

  useEffect(() => {
    const fetchAdminAndContent = async () => {
      try {
        // Check admin authentication
        const adminRes = await axios.get(`${API_URL}/api/auth/check`, {
          withCredentials: true,
        });
        if (adminRes.data.user.role !== "admin") {
          navigate("/");
        } else {
          setAdmin(adminRes.data.user);
        }

        // Fetch all courses
        const coursesRes = await axios.get(`${API_URL}/api/admin/courses`, {
          withCredentials: true,
        });
        setCourses(coursesRes.data);

        // Fetch all standalone videos
        const videosRes = await axios.get(`${API_URL}/api/free-videos/feed`, {
          withCredentials: true,
        });
        setVideos(videosRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminAndContent();
  }, [navigate]);

  // Course Deletion Handlers
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    setDeleteLoading(true); // Added
    try {
      await axios.delete(`${API_URL}/api/admin/courses/${courseId}`, {
        withCredentials: true,
      });
      setCourses(courses.filter((course) => course._id !== courseId));
      alert("Course deleted successfully!");
    } catch (err) {
      setError("Failed to delete course: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeleteLoading(false); // Added
    }
  };

  const handleDeleteAllCourses = async () => {
    if (!window.confirm("Are you sure you want to delete ALL courses? This action cannot be undone.")) return;

    setDeleteLoading(true); // Added
    try {
      await axios.delete(`${API_URL}/api/admin/courses`, { // Changed from /courses/all
        withCredentials: true,
      });
      setCourses([]);
      alert("All courses deleted successfully!");
    } catch (err) {
      setError("Failed to delete all courses: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeleteLoading(false); // Added
    }
  };

  // Video Deletion Handlers
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    setDeleteLoading(true); // Added
    try {
      await axios.delete(`${API_URL}/api/free-videos/${videoId}`, {
        withCredentials: true,
      });
      setVideos(videos.filter((video) => video._id !== videoId));
      alert("Video deleted successfully!");
    } catch (err) {
      setError("Failed to delete video: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeleteLoading(false); // Added
    }
  };

  const handleDeleteAllVideos = async () => {
    if (!window.confirm("Are you sure you want to delete ALL videos? This action cannot be undone.")) return;

    setDeleteLoading(true); // Added
    try {
      await axios.delete(`${API_URL}/api/free-videos/all`, { // Changed from /free-videos/all
        withCredentials: true,
      });
      setVideos([]);
      alert("All videos deleted successfully!");
    } catch (err) {
      setError("Failed to delete all videos: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setDeleteLoading(false); // Added
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      setError("Failed to logout: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  if (loading) return <div className="text-center text-xl mt-10 text-gray-300">Loading...</div>;
  if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />
      <div className="container mx-auto p-6">
        {deleteLoading && ( // Added
          <div className="text-center text-xl mb-4 text-gray-300">Deleting...</div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Video Management</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            aria-label="Logout" // Added
          >
            Logout
          </button>
        </div>

        {admin && (
          <div className="bg-[#111111] p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold">Admin: {admin.name}</h2>
            <p>Email: {admin.email}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="space-x-4">
            <button
              onClick={handleDeleteAllCourses}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition"
              aria-label="Delete all courses" // Added
              disabled={deleteLoading} // Added
            >
              Delete All Courses
            </button>
            <button
              onClick={handleDeleteAllVideos}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition"
              aria-label="Delete all videos" // Added
              disabled={deleteLoading} // Added
            >
              Delete All Videos
            </button>
          </div>
          <button
            onClick={() => navigate("/admindashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
            aria-label="Back to admin dashboard" // Added
          >
            Back to Admin Dashboard
          </button>
        </div>

        {/* Courses Section */}
        <h2 className="text-2xl font-semibold mb-4">Courses List</h2>
        {courses.length === 0 ? (
          <p className="text-gray-400 mb-8">No courses available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-[#111111] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              >
                {course.image && (
                  <img
                    src={course.image} // Changed to Cloudinary URL
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-100 truncate">{course.title}</h3>
                  <p className="text-gray-400 mt-1 truncate">{course.description}</p>
                  <p className="text-gray-400 mt-1">Price: ${course.price}</p>
                  <p className="text-gray-400 mt-1">Instructor: {course.instructor}</p>
                  <p className="text-gray-400 mt-1">Duration: {course.duration}</p>
                  <p className="text-gray-400 mt-1">Category: {course.category}</p>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                    aria-label={`Delete course ${course.title}`} // Added
                    disabled={deleteLoading} // Added
                  >
                    Delete Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos Section */}
        <h2 className="text-2xl font-semibold mb-4">Standalone Videos List</h2>
        {videos.length === 0 ? (
          <p className="text-gray-400">No videos available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-[#111111] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              >
                {video.thumbnailUrl && (
                  <img
                    src={video.thumbnailUrl} // Changed to Cloudinary URL
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-100 truncate">{video.title}</h3>
                  <p className="text-gray-400 mt-1">Uploader: {video.uploader}</p>
                  <p className="text-gray-400 mt-1">Views: {video.views}</p>
                  <p className="text-gray-400 mt-1">Type: {video.type}</p>
                  <button
                    onClick={() => handleDeleteVideo(video._id)}
                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                    aria-label={`Delete video ${video.title}`} // Added
                    disabled={deleteLoading} // Added
                  >
                    Delete Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminVideoDashboard;