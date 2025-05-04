import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaEye, FaCheckCircle, FaExclamationTriangle, FaPencilAlt, FaUpload } from 'react-icons/fa';
import CreatorCourseForm from './CreatorCourseForm';

// Make sure we're using the correct API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("Using API URL:", API_URL);

const CreatorCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [editCourseData, setEditCourseData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log("Fetching courses from:", `${API_URL}/api/creator/courses/my-courses`);

      const response = await axios.get(`${API_URL}/api/creator/courses/my-courses`, {
        withCredentials: true
      });

      console.log("API Response:", response.data);

      if (response.data.success) {
        setCourses(response.data.courses);
        console.log("Courses loaded:", response.data.courses.length);
      } else {
        console.error("API returned error:", response.data);
        toast.error(response.data.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      toast.error(error.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditMode(true);
    setEditCourseId(course._id);
    setEditCourseData(course);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        const response = await axios.delete(`${API_URL}/api/creator/courses/${id}`, {
          withCredentials: true
        });

        if (response.data.success) {
          toast.success("Course deleted successfully");
          fetchCourses();
        } else {
          toast.error(response.data.message || "Failed to delete course");
        }
      } catch (error) {
        console.error("Error deleting course:", error);
        toast.error(error.response?.data?.message || "Failed to delete course");
      }
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/api/creator/courses/${id}/submit`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success("Course submitted for review successfully");
        fetchCourses();
      } else {
        toast.error(response.data.message || "Failed to submit course for review");
      }
    } catch (error) {
      console.error("Error submitting course for review:", error);
      toast.error(error.response?.data?.message || "Failed to submit course for review");
    }
  };

  const handleFormSuccess = () => {
    setEditMode(false);
    setEditCourseId(null);
    setEditCourseData(null);
    setShowForm(false);
    fetchCourses();
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">Draft</span>;
      case 'pending_review':
        return <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">Pending Review</span>;
      case 'published':
        return <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Published</span>;
      case 'rejected':
        return <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">Rejected</span>;
      default:
        return <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
        >
          {showForm ? (
            <>Hide Form</>
          ) : (
            <>
              <FaUpload className="mr-2" />
              Create New Course
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editMode ? "Edit Course" : "Create New Course"}
          </h2>
          <CreatorCourseForm
            editMode={editMode}
            editCourseId={editCourseId}
            initialData={editCourseData}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Courses</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400 mb-4">You haven't created any courses yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <div className="w-full md:w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold">{course.title}</h3>
                    {getStatusBadge(course.status)}
                  </div>

                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{course.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>Price: ${course.price}</span>
                    <span>Duration: {course.duration}</span>
                    <span>Category: {course.category}</span>
                    <span>Videos: {course.videos?.length || 0}</span>
                  </div>

                  {course.status === 'rejected' && course.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded-md">
                      <p className="text-red-400 text-sm flex items-center">
                        <FaExclamationTriangle className="mr-1" />
                        Rejection reason: {course.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  {course.status === 'published' && (
                    <button
                      onClick={() => handleViewCourse(course._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
                    >
                      <FaEye className="mr-1" />
                      View
                    </button>
                  )}

                  {(course.status === 'draft' || course.status === 'rejected') && (
                    <>
                      <button
                        onClick={() => handleEdit(course)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleSubmitForReview(course._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center"
                      >
                        <FaCheckCircle className="mr-1" />
                        Submit
                      </button>

                      <button
                        onClick={() => handleDelete(course._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </>
                  )}

                  {course.status === 'pending_review' && (
                    <span className="text-yellow-500 flex items-center">
                      <FaPencilAlt className="mr-1" />
                      Under Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorCourseManagement;
