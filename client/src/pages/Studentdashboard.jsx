import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState({});
  const [newComment, setNewComment] = useState("");
  const [userData, setUserData] = useState(null);
  const videoRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student/courses", { withCredentials: true });
        setCourses(res.data);
        setCurrentVideoIndex(res.data.reduce((acc, course) => ({ ...acc, [course._id]: 0 }), {}));
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student/profile", { withCredentials: true });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchCourses();
    fetchUserData();
  }, []);

  const handleLikeDislike = async (courseId, videoIndex, action) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/student/courses/${courseId}/videos/${videoIndex}/${action}`,
        {},
        { withCredentials: true }
      );
      setCourses((prev) =>
        prev.map((course) =>
          course._id === courseId
            ? {
                ...course,
                videos: course.videos.map((video, idx) =>
                  idx === videoIndex ? { ...video, likes: res.data.likes, dislikes: res.data.dislikes } : video
                ),
              }
            : course
        )
      );
    } catch (error) {
      console.error(`Error ${action} video:`, error);
    }
  };

  const handleCommentSubmit = async (courseId, videoIndex) => {
    if (!newComment.trim()) return alert("Please enter a comment.");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/student/courses/${courseId}/videos/${videoIndex}/comment`,
        { comment: newComment },
        { withCredentials: true }
      );
      setCourses((prev) =>
        prev.map((course) =>
          course._id === courseId
            ? {
                ...course,
                videos: course.videos.map((video, idx) =>
                  idx === videoIndex ? { ...video, comments: res.data.comments } : video
                ),
              }
            : course
        )
      );
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="p-6 bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
        </div>
      <Footer />
    </>
  );
};

export default StudentDashboard;