import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/courses");
        setCourses(res.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Welcome to My Course Website 🚀</h1>

      {loading ? (
        <p className="text-center text-lg">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course._id}
                className="bg-[#111] p-4 rounded-lg shadow-md hover:shadow-lg transition "
              >
                {course.image && (
                  <img
                  src={course.image.startsWith('http') ? course.image : `http://localhost:5000${course.image}`}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                <h2 className="text-xl font-semibold">{course.title}</h2>
                <p className="text-gray-400">{course.description}</p>
                <p className="text-blue-400 font-bold mt-2">Price: ${course.price}</p>
                <p className="text-blue-400 font-bold">Instructor: {course.instructor}</p>
                <p className="text-gray-300">Duration: {course.duration}</p>
                <p className="text-gray-300">Category: {course.category}</p>
                <button
                  onClick={() => {
                    console.log("Navigating to course", course._id);  // Debugging
                    navigate(`/course/${course._id}`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-3 block w-full text-center"
                >
                  Show Details
                </button>

              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-lg">No courses available</p>
          )}
        </div>
      )}
    </div>
  );
}