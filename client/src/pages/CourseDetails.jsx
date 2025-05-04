import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import PaymentModal from "../components/PaymentModal";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]); // Stores reviews (name + comment)
  const [nameInput, setNameInput] = useState(""); // Stores student name input
  const [reviewInput, setReviewInput] = useState(""); // Stores review comment input
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/courses/${id}`);

        if (res.data.success) {
          setCourse(res.data.course);
        } else {
          setCourse(res.data); // Fallback for backward compatibility
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    const checkUserStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        setUser(res.data.user);

        // Check if user has purchased this course
        if (res.data.user) {
          const purchasedRes = await axios.get(`${API_URL}/api/student/purchased-courses`, {
            withCredentials: true
          });

          const purchased = purchasedRes.data.some(course => course._id === id);
          setHasPurchased(purchased);
        }
      } catch (error) {
        console.log("User not logged in or error checking status");
      }
    };

    fetchCourse();
    checkUserStatus();
  }, [id]);

  const handleReviewSubmit = async () => {
    if (nameInput.trim() !== "" && reviewInput.trim() !== "") {
      const newReview = {
        courseId: id,
        studentName: nameInput,
        comment: reviewInput,
      };

      try {
        // Post the new review to the backend
        const res = await axios.post("http://localhost:5000/api/reviews", newReview);

        // After submitting, update the reviews state with the new review
        setReviews([...reviews, res.data]);

        // Clear the input fields
        setNameInput("");
        setReviewInput("");
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    } else {
      alert("Please provide a name and a review.");
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/reviews/${id}`);
        setReviews(res.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [id]);

  const handleBuyNow = () => {
    console.log("Buy Now button clicked");
    console.log("User:", user);
    console.log("Has Purchased:", hasPurchased);

    if (!user) {
      toast.error("Please login to purchase this course");
      navigate("/login");
      return;
    }

    if (hasPurchased) {
      navigate(`/course-videos/${id}`);
      return;
    }

    console.log("Setting showPaymentForm to true");
    setShowPaymentForm(true);
  };

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        course={course}
      />

      <div className="max-w-6xl mx-auto py-10 px-5 flex flex-col lg:flex-row items-start gap-10">
        {/* Left Section */}
        <div className="lg:w-2/3">
          <h1 className="text-5xl font-bold">{course?.title}</h1>
          <p className="text-gray-400 mt-3">{course?.description}</p>

          {/* Instructor & Duration */}
          <p className="mt-3 text-sm text-gray-500">
            <span className="font-semibold text-white">Instructor:</span> {course?.instructor}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-white">Duration:</span> {course?.duration} hours
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-white">Category:</span> {course?.category}
          </p>

          {/* Creator Information (if it's a creator course) */}
          {course?.creatorId && (
            <div className="mt-4 flex items-center bg-gray-800 p-3 rounded-lg">
              {course.creatorId.profileImageUrl ? (
                <img
                  src={course.creatorId.profileImageUrl}
                  alt={course.creatorId.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">{course.creatorId.name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="font-semibold">Created by: {course.creatorId.name}</p>
                <p className="text-sm text-gray-400">Creator</p>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="mt-6">
            <p className="text-lg font-semibold">
              Price: <span className="text-green-400 text-3xl font-bold">₹ {course?.price}</span>{" "}
              <span className="line-through text-gray-500 text-xl">₹ 5999</span>{" "}
              (+ GST)
            </p>
          </div>

          {/* Buy Now Button */}
          <div className="mt-10 flex gap-4">
            <button
              onClick={handleBuyNow}
              className="bg-green-500 text-black text-lg font-semibold px-6 py-3 rounded-lg hover:bg-green-400 transition"
            >
              {hasPurchased ? "Go to Course" : "Buy Now"}
            </button>

            {/* Test button for direct purchase */}
            {!hasPurchased && (
              <button
                onClick={() => {
                  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

                  // Direct purchase without payment modal
                  if (user) {
                    toast.info("Processing direct purchase...");

                    axios.post(
                      `${API_URL}/api/student/purchase-course/${course._id}`,
                      {},
                      { withCredentials: true }
                    )
                      .then(() => {
                        toast.success("Course purchased successfully!");
                        navigate(`/course-videos/${course._id}`);
                      })
                      .catch(error => {
                        console.error("Error:", error);
                        toast.error("Purchase failed. Please try again.");
                      });
                  } else {
                    toast.error("Please login to purchase this course");
                    navigate("/login");
                  }
                }}
                className="bg-blue-500 text-white text-lg font-semibold px-6 py-3 rounded-lg hover:bg-blue-400 transition"
              >
                Quick Purchase (Test)
              </button>
            )}
          </div>
        </div>

        {/* Right Section (Dynamic Thumbnail + Hardcoded Info) */}
        <div className="lg:w-1/3 w-[97%]">
          <div className="relative z-[1]">
            <img
              src={course?.image?.startsWith('http') ? course?.image : `http://localhost:5000${course?.image}`}
              alt={course?.title}
              className="w-full h-auto rounded-lg"
            />
            <div className="absolute top-2 right-2 bg-black px-3 py-1 rounded-md text-sm">PLACEMENT</div>
          </div>

          {/* Hardcoded Course Info */}
          <div className="bg-gray-800 mt-6 p-5 rounded-lg grid grid-cols-2 gap-4 text-sm">
            <p>
              <span className="text-gray-400">Language:</span>{" "}
              <span className="text-green-400">English</span>
            </p>
            <p>
              <span className="text-gray-400">Certificate:</span>{" "}
              <span className="text-green-400">YES</span>
            </p>
            <p>
              <span className="text-gray-400">Schedule:</span>{" "}
              <span className="text-blue-400">Weekends</span>
            </p>
            <p>
              <span className="text-gray-400">Total Content:</span>{" "}
              <span className="text-green-400">40 Hours</span>
            </p>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="max-w-6xl mx-auto px-5 py-10">
        <h2 className="text-4xl font-bold mb-5">Student Reviews</h2>

        {/* Review Input */}
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            className="p-3 bg-gray-800 text-white w-full rounded-md"
            placeholder="Your Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <textarea
            className="p-3 bg-gray-800 text-white w-full rounded-md"
            rows="3"
            placeholder="Write your review here..."
            value={reviewInput}
            onChange={(e) => setReviewInput(e.target.value)}
          ></textarea>
          <button
            className="bg-green-500 px-5 py-2 rounded-md text-black font-semibold hover:bg-green-400 transition"
            onClick={handleReviewSubmit}
          >
            Submit Review
          </button>
        </div>

        {/* Display Reviews */}
        {reviews.length > 0 ? (
          <ul className="bg-gray-800 p-5 rounded-md space-y-3">
            {reviews.map((review, index) => (
              <li key={index} className="p-3 border-b border-gray-700 last:border-none">
                <h3 className="text-lg font-semibold text-green-400">{review.studentName}</h3>
                <p className="text-gray-400">{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>

      <div className="max-w-6xl mx-auto text-center py-20 px-5">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 text-transparent bg-clip-text">
          Zero To Job-Ready
        </h1>
        <h2 className="text-3xl mt-4">In 5 Months*</h2>

        <div className="mt-10 flex fixed left-0 bottom-10 w-full justify-center gap-5">
          <Link to="/courses" className="bg-gray-800 px-6 py-3 rounded-md">Courses</Link>
          <Link to="/callback" className="bg-gray-800 px-6 py-3 rounded-md">Request Callback</Link>
          <div className="flex gap-2">
            <button
              onClick={handleBuyNow}
              className="bg-green-500 px-6 py-3 rounded-md text-black font-semibold hover:bg-green-400 transition"
            >
              {hasPurchased ? "Go to Course" : "Buy Now"}
            </button>

            {/* Test button for direct purchase */}
            {!hasPurchased && (
              <button
                onClick={() => {
                  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

                  // Direct purchase without payment modal
                  if (user) {
                    toast.info("Processing direct purchase...");

                    axios.post(
                      `${API_URL}/api/student/purchase-course/${course._id}`,
                      {},
                      { withCredentials: true }
                    )
                      .then(() => {
                        toast.success("Course purchased successfully!");
                        navigate(`/course-videos/${course._id}`);
                      })
                      .catch(error => {
                        console.error("Error:", error);
                        toast.error("Purchase failed. Please try again.");
                      });
                  } else {
                    toast.error("Please login to purchase this course");
                    navigate("/login");
                  }
                }}
                className="bg-blue-500 px-6 py-3 rounded-md text-white font-semibold hover:bg-blue-400 transition"
              >
                Quick Buy (Test)
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <img src="https://ik.imagekit.io/sheryians/Job%20Ready%20Live%20Batch/graphweb01%20Large_ysaVk2HDm.png?updatedAt=1735828215514" alt="" />
      </div>

      <div>
        <h1 className="xl:text-9xl text-5xl font-[gilroy] xl:ml-20 ml-5">Syllabus</h1>
        <h2 className="text-gray-400 text-3xl xl:text-6xl word-spacing-3 xl:ml-20 ml-5 font-bold">Dominate From Start To Victory.</h2>
        <div className="flex p-10 items-center justify-center">
          <button className="px-5 py-3 bg-green-500 rounded-md">View Complete Syllabus</button>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default CourseDetail;
