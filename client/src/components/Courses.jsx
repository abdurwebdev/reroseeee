import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch courses
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };

    // Check user authentication
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check`, { withCredentials: true });
        setIsLoggedIn(response.data.user ? true : false);
      } catch {
        setIsLoggedIn(false);
      }
    };

    fetchCourses();
    checkAuth();
  }, []);

  const handleEnroll = async (courseId) => {
    if (!isLoggedIn) {
      alert("You must be logged in to enroll in a course.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/enroll`,
        { courseId },
        { withCredentials: true }
      );
      alert("Enrolled successfully!");
    } catch (error) {
      console.error("Enrollment failed", error);
      alert("Failed to enroll. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
      <ul>
        {courses.map((course) => (
          <li key={course._id} className="flex justify-between items-center p-3 border-b">
            <span>{course.name}</span>
            <button
              onClick={() => handleEnroll(course._id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200"
            >
              Enroll
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
