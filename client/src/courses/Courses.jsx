import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { FaGraduationCap, FaBookOpen } from "react-icons/fa";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        setUser(res.data.user);
        return res.data.user;
      } catch (error) {
        console.log("User not logged in");
        return null;
      }
    };

    const fetchPurchasedCourses = async (user) => {
      if (!user) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/student/purchased-courses`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setPurchasedCourses(res.data.courses);

          // Create a Set of purchased course IDs for easy lookup
          const courseIds = new Set(res.data.courses.map(course => course._id));
          setPurchasedCourseIds(courseIds);
        }
      } catch (error) {
        console.error("Error fetching purchased courses:", error);
      }
    };

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/admin/courses`);
        setCourses(res.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const user = await checkAuth();
      await Promise.all([
        fetchCourses(),
        fetchPurchasedCourses(user)
      ]);
    };

    init();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#000] text-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover a wide range of courses designed to help you master new skills and advance your career
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Purchased Courses Section */}
          {user && purchasedCourses.length > 0 && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <FaGraduationCap className="text-blue-500 text-3xl mr-3" />
                  <h2 className="text-3xl font-bold">Your Courses</h2>
                </div>
                <div className="text-gray-400">
                  {purchasedCourses.length} {purchasedCourses.length === 1 ? 'course' : 'courses'} purchased
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {purchasedCourses.map((course) => (
                  <div key={course._id} className="bg-[#111111] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-blue-600">
                    <div className="relative h-52 overflow-hidden group">
                      {course.image ? (
                        <img
                          src={course.image.startsWith('http') ? course.image : `http://localhost:5000${course.image}`}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/640x360?text=Course+Thumbnail';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400">No thumbnail available</span>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-xs font-bold">
                        Purchased
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4">
                          <h3 className="text-xl font-bold text-white">{course.title}</h3>
                          <p className="text-blue-400">{course.instructor}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>

                      <div className="flex justify-between items-center mb-3">
                        <p className="text-green-500 font-bold text-lg">₹{course.price}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="bg-gray-800 px-2 py-1 rounded">{course.category}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <p className="text-blue-400 text-sm">By: {course.instructor}</p>
                        <p className="text-gray-400 text-sm">{course.duration}</p>
                      </div>

                      <button
                        onClick={() => navigate(`/course-videos/${course._id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-2 block w-full text-center transition-colors duration-200"
                      >
                        Continue Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Courses Section */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <FaBookOpen className="text-blue-500 text-3xl mr-3" />
              <h2 className="text-3xl font-bold">All Courses</h2>
            </div>
            {!loading && (
              <div className="text-gray-400">
                Showing {courses.length} courses
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">No courses available</h3>
              <p className="text-gray-400 mb-4">Check back later for new courses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isPurchased = purchasedCourseIds.has(course._id);

                return (
                  <div key={course._id} className={`bg-[#111111] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${isPurchased ? 'border border-blue-600' : ''}`}>
                    <div className="relative h-52 overflow-hidden group">
                      {course.image ? (
                        <img
                          src={course.image.startsWith('http') ? course.image : `http://localhost:5000${course.image}`}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/640x360?text=Course+Thumbnail';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400">No thumbnail available</span>
                        </div>
                      )}
                      {isPurchased && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-xs font-bold">
                          Purchased
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4">
                          <h3 className="text-xl font-bold text-white">{course.title}</h3>
                          <p className="text-blue-400">{course.instructor}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>

                      <div className="flex justify-between items-center mb-3">
                        <p className="text-green-500 font-bold text-lg">₹{course.price}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="bg-gray-800 px-2 py-1 rounded">{course.category}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <p className="text-blue-400 text-sm">By: {course.instructor}</p>
                        <p className="text-gray-400 text-sm">{course.duration}</p>
                      </div>

                      {isPurchased ? (
                        <button
                          onClick={() => navigate(`/course-videos/${course._id}`)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-2 block w-full text-center transition-colors duration-200"
                        >
                          Continue Learning
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/course/${course._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-2 block w-full text-center transition-colors duration-200"
                        >
                          View Course
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Courses;
