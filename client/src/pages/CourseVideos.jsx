import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { FaPlay, FaLock } from "react-icons/fa";

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

        const hasPurchased = purchasedRes.data.some(course => course._id === courseId);

        if (!hasPurchased) {
          toast.error("You need to purchase this course to access the videos");
          navigate(`/course/${courseId}`);
          return;
        }

        // If purchased, fetch the course videos
        const res = await axios.get(`${API_URL}/api/student/course/${courseId}`, {
          withCredentials: true,
        });

        setCourse(res.data);
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

  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{course.title}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video Player */}
          <div className="lg:w-2/3">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {course.videos && course.videos.length > 0 ? (
                <video
                  ref={videoRef}
                  src={course.videos[currentVideoIndex].url}
                  className="w-full aspect-video"
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  poster={course.videos[currentVideoIndex].thumbnail}
                  preload="metadata"
                ></video>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-800">
                  <p>No videos available for this course</p>
                </div>
              )}
            </div>

            {course.videos && course.videos.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">{course.videos[currentVideoIndex].title}</h2>
                <p className="text-gray-300">{course.videos[currentVideoIndex].description}</p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">About This Course</h2>
              <p className="text-gray-300 mb-4">{course.description}</p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-gray-400 text-sm">Instructor</h3>
                  <p>{course.instructor}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm">Duration</h3>
                  <p>{course.duration}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm">Category</h3>
                  <p>{course.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video List */}
          <div className="lg:w-1/3">
            <div className="bg-gray-900 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Course Content</h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {course.videos && course.videos.length > 0 ? (
                  course.videos.map((video, index) => (
                    <div
                      key={index}
                      onClick={() => handleVideoSelect(index)}
                      className={`p-3 rounded-lg cursor-pointer ${currentVideoIndex === index
                        ? "bg-blue-900 bg-opacity-50"
                        : "bg-gray-800 hover:bg-gray-700"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {video.thumbnail ? (
                          <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/640x360?text=Video';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <FaPlay className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-24 h-16 bg-gray-700 rounded flex items-center justify-center">
                            <FaPlay className="text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{video.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-1">{video.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No videos available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseVideos;
