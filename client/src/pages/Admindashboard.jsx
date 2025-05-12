import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaCloudUploadAlt, FaVideo, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";

const Admindashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    duration: "",
    category: "",
    image: null,
    videos: [], // Array of { file, thumbnail, title, description }
    paymentOptions: {
      jazzCash: false,
      easyPaisa: false,
      payFast: false,
      bankTransfer: false
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("courseInfo");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/check", { withCredentials: true });
        if (res.data.user.role !== "admin") {
          navigate("/");
        } else {
          setAdmin(res.data.user);
        }
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/courses");
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10000 * 1024 * 1024) {
      toast.error("Image file size exceeds 1GB limit.");
      return;
    }
    setCourseData({ ...courseData, image: file });
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    const oversized = files.find((file) => file.size > 10000 * 1024 * 1024);
    if (oversized) {
      toast.error("One or more video files exceed the 1GB limit.");
      return;
    }
    const videosWithMeta = files.map((file) => ({
      file,
      thumbnail: null,
      title: "",
      description: "",
    }));
    setCourseData((prev) => ({ ...prev, videos: videosWithMeta }));
  };

  const handleVideoMetaChange = (index, field, value) => {
    const updatedVideos = [...courseData.videos];
    updatedVideos[index][field] = value;
    setCourseData({ ...courseData, videos: updatedVideos });
  };

  const handleVideoThumbnailChange = (index, file) => {
    if (file && file.size > 10000 * 1024 * 1024) {
      toast.error("Thumbnail file size exceeds 1GB limit.");
      return;
    }
    const updatedVideos = [...courseData.videos];
    updatedVideos[index].thumbnail = file;
    setCourseData({ ...courseData, videos: updatedVideos });
  };

  const handlePaymentOptionChange = (gateway) => {
    setCourseData({
      ...courseData,
      paymentOptions: {
        ...courseData.paymentOptions,
        [gateway]: !courseData.paymentOptions[gateway]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVideoLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("price", courseData.price);
    formData.append("instructor", courseData.instructor);
    formData.append("duration", courseData.duration);
    formData.append("category", courseData.category);

    // Add payment options
    Object.keys(courseData.paymentOptions).forEach(gateway => {
      formData.append(`paymentOptions[${gateway}]`, courseData.paymentOptions[gateway]);
    });

    if (courseData.image) {
      formData.append("image", courseData.image);
    }

    courseData.videos.forEach((video, index) => {
      if (video.file) {
        formData.append("videos", video.file);
        formData.append(`videoTitles[${index}]`, video.title);
        formData.append(`videoDescriptions[${index}]`, video.description);
        if (video.thumbnail) {
          formData.append("thumbnails", video.thumbnail);
        }
      }
    });

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      if (editMode) {
        await axios.put(`${API_URL}/api/admin/courses/${editCourseId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        toast.success("Course Updated Successfully!");
      } else {
        await axios.post(`${API_URL}/api/admin/create-course`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        toast.success("Course Created Successfully!");
      }

      setEditMode(false);
      setEditCourseId(null);
      setCourseData({
        title: "",
        description: "",
        price: "",
        instructor: "",
        duration: "",
        category: "",
        image: null,
        videos: [],
        paymentOptions: {
          jazzCash: false,
          easyPaisa: false,
          payFast: false,
          bankTransfer: false
        }
      });
      fetchCourses();
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      toast.error("Failed to save course: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setVideoLoading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (course) => {
    setCourseData({
      title: course.title,
      description: course.description,
      price: course.price,
      instructor: course.instructor,
      duration: course.duration,
      category: course.category,
      image: null, // Reset image as it’s not re-uploaded by default
      videos: course.videos.map((video) => ({
        file: null, // Existing videos aren’t re-uploaded
        thumbnail: null,
        title: video.title,
        description: video.description,
      })),
    });
    setEditMode(true);
    setEditCourseId(course._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/courses/${id}`, { withCredentials: true });
        alert("Course Deleted Successfully!");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout.");
    }
  };


  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="mx-auto p-6 bg-black shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-white">Admin Dashboard</h1>
        <div className="text-white mb-5 flex items-center justify-between flex-wrap gap-2">
          <Link to='user-admin-dashboard' className="px-4 py-2 rounded-md bg-blue-500">Manage Users</Link>
          <Link to='video-admin-dashboard' className="px-4 py-2 rounded-md bg-blue-500">Manage Videos</Link>
          <Link to='course-dashboard' className="px-4 py-2 rounded-md bg-indigo-500">Manage Courses</Link>
          <Link to='course-review' className="px-4 py-2 rounded-md bg-yellow-500">Review Creator Courses</Link>
          <Link to='coder-verification' className="px-4 py-2 rounded-md bg-teal-500">Coder Verification</Link>
          <Link to='earnings-dashboard' className="px-4 py-2 rounded-md bg-green-500">Earnings Dashboard</Link>
          <Link to='withdrawals-dashboard' className="px-4 py-2 rounded-md bg-purple-500">Manage Withdrawals</Link>
        </div>
        {admin && (
          <div className="bg-[#111111] text-white p-4 rounded shadow mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Admin: {admin.name}</h2>
              <p>Email: {admin.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        )}




        {/* Course List */}
        <h2 className="text-2xl font-bold text-white mb-2">Available Courses</h2>
        <ul className="space-y-2">
          {courses.map((course) => (
            <li
              key={course._id}
              className="p-4 border rounded-lg shadow-md flex justify-between items-center bg-[#111111]"
            >
              <div className="flex items-center space-x-4">
                {course.image && (
                  <img
                    src={`http://localhost:5000${course.image}`}
                    alt={course.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="text-xl text-white font-semibold">{course.title}</h3>
                  <p className="text-white">{course.description}</p>
                  <p className="text-white">Price: ${course.price}</p>
                  <p className="text-white">Instructor: {course.instructor}</p>
                  <p className="text-white">Duration: {course.duration}</p>
                  <p className="text-white">Category: {course.category}</p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEdit(course)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Footer />
      </div>
    </>
  );
};

export default Admindashboard;