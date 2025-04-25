import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/courses");
        setCourses(res.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#000] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">All Courses</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-[#111111] p-4 rounded-lg shadow-lg">
                {course.image && (
                  <img
                    src={`http://localhost:5000${course.image}`}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{course.description}</p>
                <p className="text-blue-400 font-bold mt-2">Price: ${course.price}</p>
                <p className="text-blue-400 font-bold ">Instructor: {course.instructor}</p>
                <p className="text-gray-400">Duration: {course.duration}</p>
                <p className="text-gray-400">Category: {course.category}</p>
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-3 block w-full text-center"
                >
                  Show Details
                </button>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Courses;
