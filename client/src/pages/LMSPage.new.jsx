import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { FaPlay, FaBook, FaCalendarAlt, FaClock, FaGraduationCap } from "react-icons/fa";

const LMSPage = () => {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        setUser(res.data.user);
        return res.data.user;
      } catch (error) {
        toast.error("Please login to access your courses");
        navigate("/login");
        return null;
      }
    };

    const fetchPurchasedCourses = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/student/purchased-courses`, {
          withCredentials: true,
        });
        setPurchasedCourses(res.data);
      } catch (error) {
        console.error("Error fetching purchased courses:", error);
        toast.error("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const user = await checkAuth();
      if (user) {
        fetchPurchasedCourses();
      }
    };

    init();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateProgress = (course) => {
    // This is a placeholder. In a real app, you would track which videos the user has watched
    // and calculate the progress based on that.
    return Math.floor(Math.random() * 100); // Random progress for demo
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Learning Dashboard</h1>
              <p className="text-xl text-gray-300">Continue your learning journey</p>
            </div>
            {user && (
              <div className="mt-4 md:mt-0 bg-black/30 backdrop-blur-sm px-6 py-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p className="text-gray-300 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {purchasedCourses.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <FaBook className="text-5xl text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No courses purchased yet</h2>
            <p className="text-gray-400 mb-6">Explore our course catalog and start learning today!</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Courses Enrolled</p>
                    <h3 className="text-3xl font-bold">{purchasedCourses.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center">
                    <FaBook className="text-blue-500 text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Total Videos</p>
                    <h3 className="text-3xl font-bold">
                      {purchasedCourses.reduce((total, course) => total + (course.videos?.length || 0), 0)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center">
                    <FaPlay className="text-green-500 text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Last Activity</p>
                    <h3 className="text-xl font-bold">
                      {purchasedCourses.length > 0 
                        ? formatDate(purchasedCourses[0].updatedAt || purchasedCourses[0].createdAt) 
                        : 'N/A'}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <FaCalendarAlt className="text-purple-500 text-xl" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* My Courses Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Courses</h2>
                <button 
                  onClick={() => navigate('/courses')}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Browse more courses
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedCourses.map((course) => (
                  <div key={course._id} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      {course.image ? (
                        <img
                          src={course.image.startsWith('http') ? course.image : `http://localhost:5000${course.image}`}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/640x360?text=Course+Thumbnail';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400">No thumbnail available</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                        <div className="p-4">
                          <h3 className="text-xl font-bold text-white">{course.title}</h3>
                          <p className="text-blue-400">{course.instructor}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-400">Progress</span>
                          <span className="text-sm text-gray-400">{calculateProgress(course)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${calculateProgress(course)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <FaCalendarAlt className="mr-1" />
                          <span>Purchased: {formatDate(course.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <FaClock className="mr-1" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <span className="text-green-500 font-bold">{course.videos?.length || 0}</span> videos
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/course/${course._id}`)}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => navigate(`/course-videos/${course._id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                          >
                            <FaPlay className="mr-1 text-xs" /> Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Learning Path Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recommended Learning Path</h2>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                    <FaGraduationCap className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Continue Your Learning Journey</h3>
                    <p className="text-gray-400">Based on your enrolled courses</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {purchasedCourses.slice(0, 3).map((course, index) => (
                    <div key={course._id} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-4">
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{course.title}</h4>
                        <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full" 
                            style={{ width: `${calculateProgress(course)}%` }}
                          ></div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/course-videos/${course._id}`)}
                        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default LMSPage;
