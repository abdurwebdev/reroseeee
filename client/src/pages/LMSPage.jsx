import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LMSPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState({});
  const [newComments, setNewComments] = useState({});
  const [userData, setUserData] = useState(null);
  const videoRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student/courses", {
          withCredentials: true,
        });
        setCourses(res.data);
        setCurrentVideoIndex(
          res.data.reduce((acc, course) => ({ ...acc, [course._id]: 0 }), {})
        );
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student/profile", {
          withCredentials: true,
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchCourses();
    fetchUserData();
  }, []);

  const handleLikeDislike = async (courseId, videoIndex, action) => {
    setCourses((prev) =>
      prev.map((course) =>
        course._id === courseId
          ? {
              ...course,
              videos: course.videos.map((video, idx) =>
                idx === videoIndex
                  ? {
                      ...video,
                      likes:
                        action === "like"
                          ? video.likes.includes(userData?._id)
                            ? video.likes.filter((id) => id !== userData?._id)
                            : [...video.likes, userData?._id]
                          : video.likes,
                      dislikes:
                        action === "dislike"
                          ? video.dislikes.includes(userData?._id)
                            ? video.dislikes.filter((id) => id !== userData?._id)
                            : [...video.dislikes, userData?._id]
                          : video.dislikes,
                    }
                  : video
              ),
            }
          : course
      )
    );

    try {
      await axios.post(
        `http://localhost:5000/api/student/courses/${courseId}/videos/${videoIndex}/${action}`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error(`Error ${action} video:`, error);
    }
  };

  const handleCommentSubmit = async (courseId, videoIndex) => {
    const commentText = newComments[`${courseId}-${videoIndex}`];
    if (!commentText?.trim()) return alert("Please enter a comment.");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/student/courses/${courseId}/videos/${videoIndex}/comment`,
        { comment: commentText },
        { withCredentials: true }
      );
      setCourses((prev) =>
        prev.map((course) =>
          course._id === courseId
            ? {
                ...course,
                videos: course.videos.map((video, idx) =>
                  idx === videoIndex
                    ? { ...video, comments: res.data.comments }
                    : video
                ),
              }
            : course
        )
      );
      setNewComments((prev) => ({ ...prev, [`${courseId}-${videoIndex}`]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleVideoSelect = (courseId, index) => {
    setCurrentVideoIndex((prev) => ({ ...prev, [courseId]: index }));
  };

  const handleNextCourse = () => {
    if (currentCourseIndex < courses.length - 1) {
      setCurrentCourseIndex(currentCourseIndex + 1);
    }
  };

  const currentCourse = courses[currentCourseIndex];

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row lg:flex p-6 bg-black text-white">
        <div className="w-full">
          {currentCourse ? (
            <div>
              {currentCourse.videos.length > 0 && (
                <div className="mt-4">
                  {/* Currently Playing Video */}
                  <div className="relative mb-6 w-full">
                  <video
  ref={(el) =>
    (videoRefs.current[
      `${currentCourse._id}-${currentVideoIndex[currentCourse._id]}`
    ] = el)
  }
  src={currentCourse.videos[currentVideoIndex[currentCourse._id]].url}
  className="w-full xl:w-full rounded-lg"
  controlsList="nodownload noplaybackrate" // discourage downloads & speed change
  disablePictureInPicture // disable PiP
  controls // Optional: remove if you're making custom UI
  onContextMenu={(e) => e.preventDefault()} // disable right-click menu
/>

                  </div>

                  {/* Title and Description Below Video */}
                  <h3 className="text-lg font-semibold mt-2">
                    {currentCourse.videos[currentVideoIndex[currentCourse._id]].title}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {currentCourse.videos[currentVideoIndex[currentCourse._id]].description}
                  </p>

                  {/* Like, Dislike, and Comment Section */}
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={() =>
                        handleLikeDislike(
                          currentCourse._id,
                          currentVideoIndex[currentCourse._id],
                          "like"
                        )
                      }
                      className={`px-3 py-1 rounded flex items-center ${
                        currentCourse.videos[
                          currentVideoIndex[currentCourse._id]
                        ].likes.includes(userData?._id)
                          ? "bg-green-700"
                          : "bg-green-600"
                      }`}
                    >
                      👍{" "}
                      {
                        currentCourse.videos[currentVideoIndex[currentCourse._id]]
                          .likes.length
                      }
                    </button>
                    <button
                      onClick={() =>
                        handleLikeDislike(
                          currentCourse._id,
                          currentVideoIndex[currentCourse._id],
                          "dislike"
                        )
                      }
                      className={`px-3 py-1 rounded flex items-center ${
                        currentCourse.videos[
                          currentVideoIndex[currentCourse._id]
                        ].dislikes.includes(userData?._id)
                          ? "bg-red-700"
                          : "bg-red-600"
                      }`}
                    >
                      👎{" "}
                      {
                        currentCourse.videos[currentVideoIndex[currentCourse._id]]
                          .dislikes.length
                      }
                    </button>
                  </div>
                  <div className="mt-4 w-full xl:w-[70%]">
                    <h4 className="text-md font-semibold">Comments:</h4>
                    <div className="mt-2 flex mb-5">
                      <input
                        type="text"
                        value={
                          newComments[
                            `${currentCourse._id}-${currentVideoIndex[currentCourse._id]}`
                          ] || ""
                        }
                        onChange={(e) =>
                          setNewComments((prev) => ({
                            ...prev,
                            [`${currentCourse._id}-${currentVideoIndex[currentCourse._id]}`]:
                              e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                        className="w-full p-2 border rounded-l text-black bg-white outline-none"
                      />
                      <button
                        onClick={() =>
                          handleCommentSubmit(
                            currentCourse._id,
                            currentVideoIndex[currentCourse._id]
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r"
                      >
                        Post
                      </button>
                    </div>
                    <ul className="space-y-2 h-20 overflow-y-auto">
                      {currentCourse.videos[
                        currentVideoIndex[currentCourse._id]
                      ].comments.map((comment) => (
                        <li key={comment._id} className="bg-gray-800 p-2 rounded">
                          <strong>{comment.userId?.name || "Anonymous"}:</strong>{" "}
                          {comment.comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleNextCourse}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-5"
                >
                  Next Course
                </button>
              </div>
            </div>
          ) : (
            <p>No courses available.</p>
          )}
        </div>

        <div className="w-full lg:w-[60%]">
          {currentCourse && (
            <div className="w-full p-4 rounded mb-4">
              <ul className="space-y-4">
                {currentCourse.videos.map((video, index) => (
                  <li
                    key={video._id}
                    onClick={() => handleVideoSelect(currentCourse._id, index)}
                    className="p-2 cursor-pointer flex flex-col space-y-2 rounded transition-all duration-200"
                  >
                    <div>
                      <img
                        src={video.thumbnail} // Use direct Cloudinary URL
                        alt={video.title}
                        className="w-full h-48 md object-cover rounded"
                      />
                      <h4 className="text-white font-semibold">{video.title}</h4>
                      <p className="text-gray-300 text-sm">{video.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LMSPage;