import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaVideo, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaUniversity, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CreatorCourseForm = ({ editMode, editCourseId, initialData, onSuccess }) => {
  const [courseData, setCourseData] = useState(initialData || {
    title: "",
    description: "",
    price: "",
    instructor: "",
    duration: "",
    category: "",
    image: null,
    videos: [],
    paymentOptions: {
      jazzCash: false,
      easyPaisa: false,
      payFast: false,
      bankTransfer: false
    }
  });

  const [activeTab, setActiveTab] = useState("courseInfo");
  const [videoLoading, setVideoLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFiles, setVideoFiles] = useState([]);
  const [thumbnailFiles, setThumbnailFiles] = useState([]);
  const [videoTitles, setVideoTitles] = useState([]);
  const [videoDescriptions, setVideoDescriptions] = useState([]);
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handlePaymentOptionChange = (e) => {
    setCourseData({
      ...courseData,
      paymentOptions: {
        ...courseData.paymentOptions,
        [e.target.name]: e.target.checked
      }
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setCourseData({
        ...courseData,
        image: e.target.files[0]
      });
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setVideoFiles([...videoFiles, ...newFiles]);

      // Initialize titles and descriptions for new videos
      const newTitles = [...videoTitles];
      const newDescriptions = [...videoDescriptions];

      newFiles.forEach(() => {
        newTitles.push("");
        newDescriptions.push("");
      });

      setVideoTitles(newTitles);
      setVideoDescriptions(newDescriptions);
    }
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setThumbnailFiles([...thumbnailFiles, ...newFiles]);
    }
  };

  const handleVideoTitleChange = (index, value) => {
    const newTitles = [...videoTitles];
    newTitles[index] = value;
    setVideoTitles(newTitles);
  };

  const handleVideoDescriptionChange = (index, value) => {
    const newDescriptions = [...videoDescriptions];
    newDescriptions[index] = value;
    setVideoDescriptions(newDescriptions);
  };

  const removeVideo = (index) => {
    const newVideoFiles = [...videoFiles];
    const newThumbnailFiles = [...thumbnailFiles];
    const newVideoTitles = [...videoTitles];
    const newVideoDescriptions = [...videoDescriptions];

    newVideoFiles.splice(index, 1);
    if (newThumbnailFiles[index]) {
      newThumbnailFiles.splice(index, 1);
    }
    newVideoTitles.splice(index, 1);
    newVideoDescriptions.splice(index, 1);

    setVideoFiles(newVideoFiles);
    setThumbnailFiles(newThumbnailFiles);
    setVideoTitles(newVideoTitles);
    setVideoDescriptions(newVideoDescriptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseData.title || !courseData.description || !courseData.price || !courseData.instructor || !courseData.duration || !courseData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (videoFiles.length === 0 && !editMode) {
      toast.error("Please upload at least one video");
      return;
    }

    if (!courseData.image && !editMode) {
      toast.error("Please upload a course thumbnail");
      return;
    }

    // Check if all videos have titles
    if (videoFiles.length > 0 && videoTitles.some(title => !title)) {
      toast.error("Please provide titles for all videos");
      return;
    }

    setVideoLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("price", courseData.price);
      formData.append("instructor", courseData.instructor);
      formData.append("duration", courseData.duration);
      formData.append("category", courseData.category);

      // Append payment options
      Object.keys(courseData.paymentOptions).forEach(key => {
        formData.append(`paymentOptions[${key}]`, courseData.paymentOptions[key]);
      });

      // Append course image if available
      if (courseData.image instanceof File) {
        formData.append("image", courseData.image);
      }

      // Append videos and their details
      videoFiles.forEach((file, index) => {
        formData.append("videos", file);
        formData.append("videoTitles", videoTitles[index] || "");
        formData.append("videoDescriptions", videoDescriptions[index] || "");
      });

      // Append thumbnails if available
      thumbnailFiles.forEach(file => {
        formData.append("thumbnails", file);
      });

      let response;

      if (editMode) {
        response = await axios.put(`${API_URL}/api/creator/courses/${editCourseId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        toast.success("Course Updated Successfully!");
      } else {
        response = await axios.post(`${API_URL}/api/creator/courses/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        toast.success("Course Created Successfully!");
      }

      // Reset form
      setCourseData({
        title: "",
        description: "",
        price: "",
        instructor: "",
        duration: "",
        category: "",
        image: null,
        videos: [],
        paymentOptions: {
          jazzCash: false,
          easyPaisa: false,
          payFast: false,
          bankTransfer: false
        }
      });
      setVideoFiles([]);
      setThumbnailFiles([]);
      setVideoTitles([]);
      setVideoDescriptions([]);
      setActiveTab("courseInfo");
      setUploadProgress(0);

      // Call success callback
      if (onSuccess) {
        onSuccess(response.data.course);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      toast.error("Failed to save course: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setVideoLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-[#111111] p-6 rounded-lg shadow-lg">
      {videoLoading && (
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm text-gray-400">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Course Info Tab */}
        {activeTab === "courseInfo" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Course Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Course Title"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Price (PKR)</label>
                <input
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Course Price"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Course Description"
                rows="4"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 mb-2">Instructor</label>
                <input
                  type="text"
                  name="instructor"
                  value={courseData.instructor}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Instructor Name"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={courseData.duration}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 10 hours"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={courseData.category}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Course Thumbnail</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => imageInputRef.current.click()}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <FaCloudUploadAlt className="mr-2" />
                  {courseData.image ? "Change Image" : "Upload Image"}
                </button>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                {courseData.image && (
                  <span className="ml-3 text-green-500">
                    {courseData.image instanceof File
                      ? courseData.image.name
                      : "Current image will be kept"}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Course Videos</h3>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => videoInputRef.current.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FaVideo className="mr-2" />
                Add Videos
              </button>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                className="hidden"
                accept="video/*"
                multiple
              />
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => thumbnailInputRef.current.click()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FaCloudUploadAlt className="mr-2" />
                Add Video Thumbnails
              </button>
              <input
                type="file"
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
                className="hidden"
                accept="image/*"
                multiple
              />
              <p className="text-sm text-gray-400 mt-2">
                Upload thumbnails in the same order as videos. If you don't upload thumbnails, videos will use the first frame as thumbnail.
              </p>
            </div>

            {videoFiles.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Videos to Upload</h4>
                {videoFiles.map((file, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Video {index + 1}: {file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-gray-300 mb-1">Video Title</label>
                        <input
                          type="text"
                          value={videoTitles[index] || ""}
                          onChange={(e) => handleVideoTitleChange(index, e.target.value)}
                          className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="Video Title"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-1">Thumbnail</label>
                        <span className="text-gray-400">
                          {thumbnailFiles[index]
                            ? thumbnailFiles[index].name
                            : "No thumbnail selected"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">Video Description</label>
                      <textarea
                        value={videoDescriptions[index] || ""}
                        onChange={(e) => handleVideoDescriptionChange(index, e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Video Description"
                        rows="2"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-800 rounded-md">
                <FaVideo className="mx-auto text-4xl text-gray-500 mb-2" />
                <p className="text-gray-400">No videos added yet. Click "Add Videos" to upload.</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Payment Options</h3>
            <p className="text-gray-400 mb-4">Select the payment methods you want to accept for this course:</p>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="jazzCash"
                  name="jazzCash"
                  checked={courseData.paymentOptions.jazzCash}
                  onChange={handlePaymentOptionChange}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor="jazzCash" className="flex items-center text-white">
                  <FaMobileAlt className="text-pink-500 mr-2" />
                  JazzCash
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="easyPaisa"
                  name="easyPaisa"
                  checked={courseData.paymentOptions.easyPaisa}
                  onChange={handlePaymentOptionChange}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor="easyPaisa" className="flex items-center text-white">
                  <FaMobileAlt className="text-green-500 mr-2" />
                  EasyPaisa
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="payFast"
                  name="payFast"
                  checked={courseData.paymentOptions.payFast}
                  onChange={handlePaymentOptionChange}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor="payFast" className="flex items-center text-white">
                  <FaCreditCard className="text-blue-500 mr-2" />
                  PayFast
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bankTransfer"
                  name="bankTransfer"
                  checked={courseData.paymentOptions.bankTransfer}
                  onChange={handlePaymentOptionChange}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor="bankTransfer" className="flex items-center text-white">
                  <FaUniversity className="text-yellow-500 mr-2" />
                  Bank Transfer
                </label>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-md">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <FaMoneyBillWave className="text-green-500 mr-2" />
                Earnings Information
              </h4>
              <p className="text-gray-400 text-sm">
                As a creator, you'll earn 70% of the course price for each sale. The platform fee is 30%.
              </p>
              {courseData.price && (
                <div className="mt-2">
                  <p className="text-white">
                    Course Price: <span className="font-semibold">${courseData.price}</span>
                  </p>
                  <p className="text-white">
                    Your Earnings per Sale: <span className="font-semibold">${(courseData.price * 0.7).toFixed(2)}</span>
                  </p>
                  <p className="text-white">
                    Platform Fee: <span className="font-semibold">${(courseData.price * 0.3).toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation and Submit Buttons */}
        <div className="flex justify-between mt-6">
          <div>
            {activeTab === "courseInfo" ? (
              <button
                type="button"
                onClick={() => setActiveTab("videos")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition"
              >
                Next: Videos
              </button>
            ) : activeTab === "videos" ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("courseInfo")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition"
                >
                  Back: Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("payment")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition"
                >
                  Next: Payment
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("videos")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition"
              >
                Back: Videos
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
            disabled={videoLoading}
          >
            {editMode ? "Update Course" : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatorCourseForm;
