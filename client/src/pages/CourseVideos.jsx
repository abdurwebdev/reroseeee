import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import CourseVideoPlayer from "../components/course/CourseVideoPlayer";

const CourseVideos = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [user, setUser] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        setUser(res.data.user);
        return res.data.user;
      } catch (error) {
        toast.error("Please login to access this page");
        navigate("/login");
        return null;
      }
    };

    const fetchCourseVideos = async (user) => {
      if (!user) return;

      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

        // First check if the user has purchased this course
        const purchasedRes = await axios.get(`${API_URL}/api/student/purchased-courses`, {
          withCredentials: true,
        });

        const hasPurchased = purchasedRes.data.courses.some(course => course._id === courseId);

        if (!hasPurchased) {
          toast.error("You need to purchase this course to access the videos");
          navigate(`/course/${courseId}`);
          return;
        }

        // If purchased, fetch the course videos
        const res = await axios.get(`${API_URL}/api/student/course/${courseId}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setCourse(res.data.course);
        } else {
          toast.error(res.data.message || "Failed to load course videos");
          navigate(`/course/${courseId}`);
        }
      } catch (error) {
        console.error("Error fetching course videos:", error);
        if (error.response?.status === 403) {
          toast.error("You need to purchase this course to access the videos");
          navigate(`/course/${courseId}`);
        } else {
          toast.error("Failed to load course videos");
        }
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const user = await checkAuth();
      if (user) {
        fetchCourseVideos(user);
      }
    };

    init();
  }, [courseId, navigate]);

  const handleVideoChange = (index, updatedCourse = null) => {
    setCurrentVideoIndex(index);

    // If an updated course object is provided (e.g., after adding a comment),
    // update the course state
    if (updatedCourse) {
      setCourse(updatedCourse);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate("/courses")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="w-full max-w-[2160px] mx-auto px-4 py-4">
        <CourseVideoPlayer
          course={course}
          videoIndex={currentVideoIndex}
          onVideoChange={handleVideoChange}
          currentUser={user}
        />
      </div>

      <Footer />
    </div>
  );
};

export default CourseVideos;
