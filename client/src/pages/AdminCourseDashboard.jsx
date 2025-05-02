import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminCourseForm from "../components/admin/AdminCourseForm";
import CourseListItem from "../components/admin/CourseListItem";
import { toast } from "react-toastify";

const AdminCourseDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [courses, setCourses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [editCourseData, setEditCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        if (res.data.user.role !== "admin") {
          navigate("/");
          toast.error("You don't have permission to access this page");
        } else {
          setAdmin(res.data.user);
        }
      } catch (error) {
        navigate("/login");
        toast.error("Please login to access this page");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.get(`${API_URL}/api/admin/courses`);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    }
  };

  const handleEdit = (course) => {
    setEditMode(true);
    setEditCourseId(course._id);
    
    // Format the course data for the form
    setEditCourseData({
      title: course.title,
      description: course.description,
      price: course.price,
      instructor: course.instructor,
      duration: course.duration,
      category: course.category,
      image: null, // Reset image as it's not re-uploaded by default
      videos: course.videos.map((video) => ({
        file: null, // Existing videos aren't re-uploaded
        thumbnail: null,
        title: video.title,
        description: video.description,
      })),
      paymentOptions: course.paymentOptions || {
        jazzCash: false,
        easyPaisa: false,
        payFast: false,
        bankTransfer: false
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        await axios.delete(`${API_URL}/api/admin/courses/${id}`, { withCredentials: true });
        toast.success("Course Deleted Successfully!");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        toast.error("Failed to delete course.");
      }
    }
  };

  const handleFormSuccess = () => {
    setEditMode(false);
    setEditCourseId(null);
    setEditCourseData(null);
    fetchCourses();
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Course Dashboard</h1>
          
          {admin && (
            <div className="bg-[#111111] p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Admin: {admin.name}</h2>
                <p className="text-gray-400">Manage your courses and videos</p>
              </div>
              <button
                onClick={() => navigate('/admindashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {editMode ? "Edit Course" : "Create New Course"}
            </h2>
            <AdminCourseForm 
              editMode={editMode}
              editCourseId={editCourseId}
              initialData={editCourseData}
              onSuccess={handleFormSuccess}
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>
            {courses.length === 0 ? (
              <p className="text-gray-400">No courses available. Create your first course above.</p>
            ) : (
              <ul>
                {courses.map((course) => (
                  <CourseListItem 
                    key={course._id}
                    course={course}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewCourse}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AdminCourseDashboard;
