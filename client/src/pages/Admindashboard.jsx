import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
  });
  const [editMode, setEditMode] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
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
      alert("Image file size exceeds 1GB limit.");
      return;
    }
    setCourseData({ ...courseData, image: file });
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    const oversized = files.find((file) => file.size > 10000 * 1024 * 1024);
    if (oversized) {
      alert("One or more video files exceed the 1GB limit.");
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
      alert("Thumbnail file size exceeds 1GB limit.");
      return;
    }
    const updatedVideos = [...courseData.videos];
    updatedVideos[index].thumbnail = file;
    setCourseData({ ...courseData, videos: updatedVideos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVideoLoading(true);

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("price", courseData.price);
    formData.append("instructor", courseData.instructor);
    formData.append("duration", courseData.duration);
    formData.append("category", courseData.category);
    if (courseData.image) {
      formData.append("image", courseData.image);
    }

    courseData.videos.forEach((video, index) => {
      formData.append("videos", video.file);
      formData.append(`videoTitles[${index}]`, video.title);
      formData.append(`videoDescriptions[${index}]`, video.description);
      if (video.thumbnail) {
        formData.append("thumbnails", video.thumbnail);
      }
    });

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/admin/courses/${editCourseId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        alert("Course Updated Successfully!");
      } else {
        await axios.post("http://localhost:5000/api/admin/create-course", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        alert("Course Created Successfully!");
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
      });
      fetchCourses();
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      alert("Failed to save course: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setVideoLoading(false);
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
        <div className=" text-white mb-5 flex items-center justify-between">
          <Link to='user-admin-dashboard' className="px-4 py-2 rounded-md bg-blue-500">Manage Users</Link>
          <Link to='video-admin-dashboard' className="px-4 py-2 rounded-md bg-blue-500">Manage Videos</Link>
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


        {/* Course Creation / Edit Form */}
        <form onSubmit={handleSubmit} className="bg-[#111111] text-white p-4 rounded shadow mb-6">
          <input
            name="title"
            value={courseData.title}
            onChange={handleChange}
            placeholder="Course Title"
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleChange}
            placeholder="Course Description"
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <input
            name="price"
            type="number"
            value={courseData.price}
            onChange={handleChange}
            placeholder="Course Price"
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <input
            name="instructor"
            value={courseData.instructor}
            onChange={handleChange}
            placeholder="Instructor"
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <input
            name="duration"
            value={courseData.duration}
            onChange={handleChange}
            placeholder="Duration"
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <input
            name="category"
            value={courseData.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 mb-3 border rounded"
          />
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoChange}
            className="w-full p-3 mb-3 border rounded"
          />

          {/* Video Metadata Fields */}
          {courseData.videos.map((video, index) => (
            <div key={index} className="mb-4 p-4 border rounded bg-[#1a1a1a]">
              <p className="mb-2 text-sm text-gray-300">
                Video {index + 1}: {video.file?.name || "Existing Video"}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleVideoThumbnailChange(index, e.target.files[0])}
                className="w-full p-2 mb-2 border rounded"
                placeholder="Upload Thumbnail"
              />
              <input
                type="text"
                value={video.title}
                onChange={(e) => handleVideoMetaChange(index, "title", e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                placeholder="Video Title"
              />
              <textarea
                value={video.description}
                onChange={(e) => handleVideoMetaChange(index, "description", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Video Description"
              />
            </div>
          ))}

          {videoLoading && <p className="text-white">Uploading videos...</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
          >
            {editMode ? "Update Course" : "Create Course"}
          </button>
        </form>

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