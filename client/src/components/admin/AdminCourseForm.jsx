import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaVideo, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from 'axios';

const AdminCourseForm = ({ editMode, editCourseId, initialData, onSuccess }) => {
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
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10000 * 1024 * 1024) {
      toast.error("Image file size exceeds 1GB limit.");
      return;
    }
    setCourseData({ ...courseData, image: file });
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const oversized = files.find((file) => file.size > 10000 * 1024 * 1024);
    if (oversized) {
      toast.error("One or more video files exceed the 1GB limit.");
      return;
    }

    // Generate default titles from filenames
    const videosWithMeta = files.map((file) => ({
      file,
      thumbnail: null,
      title: file.name.split('.').slice(0, -1).join('.'), // Remove extension
      description: "",
    }));

    setCourseData((prev) => ({ ...prev, videos: videosWithMeta }));
    toast.success(`${files.length} video${files.length > 1 ? 's' : ''} selected successfully.`);
  };

  const handleVideoMetaChange = (index, field, value) => {
    const updatedVideos = [...courseData.videos];
    updatedVideos[index][field] = value;
    setCourseData({ ...courseData, videos: updatedVideos });
  };

  const handleVideoThumbnailChange = (index, file) => {
    if (file && file.size > 10000 * 1024 * 1024) {
      toast.error("Thumbnail file size exceeds 1GB limit.");
      return;
    }
    const updatedVideos = [...courseData.videos];
    updatedVideos[index].thumbnail = file;
    setCourseData({ ...courseData, videos: updatedVideos });
  };

  const handlePaymentOptionChange = (gateway) => {
    setCourseData({
      ...courseData,
      paymentOptions: {
        ...courseData.paymentOptions,
        [gateway]: !courseData.paymentOptions[gateway]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVideoLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("price", courseData.price);
    formData.append("instructor", courseData.instructor);
    formData.append("duration", courseData.duration);
    formData.append("category", courseData.category);

    // Add payment options
    Object.keys(courseData.paymentOptions).forEach(gateway => {
      formData.append(`paymentOptions[${gateway}]`, courseData.paymentOptions[gateway]);
    });

    if (courseData.image) {
      formData.append("image", courseData.image);
    }

    courseData.videos.forEach((video, index) => {
      if (video.file) {
        formData.append("videos", video.file);
        formData.append(`videoTitles[${index}]`, video.title);
        formData.append(`videoDescriptions[${index}]`, video.description);
        if (video.thumbnail) {
          formData.append("thumbnails", video.thumbnail);
        }
      }
    });

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      if (editMode) {
        await axios.put(`${API_URL}/api/admin/courses/${editCourseId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        toast.success("Course Updated Successfully!");
      } else {
        await axios.post(`${API_URL}/api/admin/create-course`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        toast.success("Course Created Successfully!");
      }

      // Reset form and notify parent component
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

      if (onSuccess) {
        onSuccess();
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
    <div className="bg-[#111111] text-white p-4 rounded shadow mb-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`py-2 px-4 ${activeTab === "courseInfo" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
          onClick={() => setActiveTab("courseInfo")}
        >
          Course Info
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "videos" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "payment" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"}`}
          onClick={() => setActiveTab("payment")}
        >
          Payment Options
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Course Info Tab */}
        {activeTab === "courseInfo" && (
          <div>
            <input
              name="title"
              value={courseData.title}
              onChange={handleChange}
              placeholder="Course Title"
              className="w-full p-3 mb-3 border rounded"
              required
            />
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleChange}
              placeholder="Course Description"
              className="w-full p-3 mb-3 border rounded"
              required
            />
            <input
              name="price"
              type="number"
              value={courseData.price}
              onChange={handleChange}
              placeholder="Course Price"
              className="w-full p-3 mb-3 border rounded"
              required
            />
            <input
              name="instructor"
              value={courseData.instructor}
              onChange={handleChange}
              placeholder="Instructor"
              className="w-full p-3 mb-3 border rounded"
              required
            />
            <input
              name="duration"
              value={courseData.duration}
              onChange={handleChange}
              placeholder="Duration"
              className="w-full p-3 mb-3 border rounded"
              required
            />
            <input
              name="category"
              value={courseData.category}
              onChange={handleChange}
              placeholder="Category"
              className="w-full p-3 mb-3 border rounded"
              required
            />
            <div className="mb-3">
              <label className="block mb-2">Course Thumbnail</label>
              <div className="flex items-center">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <FaCloudUploadAlt className="mr-2" /> Upload Thumbnail
                </button>
                {courseData.image && (
                  <span className="ml-3 text-green-400">
                    {typeof courseData.image === 'string'
                      ? 'Current thumbnail will be kept'
                      : `Selected: ${courseData.image.name}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div>
            <div className="mb-4 flex items-center">
              <FaCloudUploadAlt className="text-blue-500 text-2xl mr-2" />
              <h3 className="text-xl font-semibold">Upload Course Videos</h3>
            </div>

            <div className="mb-4 p-4 border border-dashed border-gray-600 rounded-lg">
              <div className="flex flex-col items-center justify-center">
                <FaVideo className="text-blue-500 text-4xl mb-2" />
                <span className="text-gray-300 mb-2">Select video files to upload</span>
                <span className="text-xs text-gray-500 mb-2">MP4 format, max 1GB per file</span>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  onClick={() => videoInputRef.current.click()}
                >
                  Select Videos
                </button>
                {courseData.videos.length > 0 && (
                  <span className="mt-2 text-green-400">
                    {courseData.videos.length} video{courseData.videos.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
            </div>

            {/* Video Metadata Fields */}
            {courseData.videos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Video Details</h3>
                {courseData.videos.map((video, index) => (
                  <div key={index} className="mb-4 p-4 border rounded bg-[#1a1a1a]">
                    <p className="mb-2 text-sm text-gray-300">
                      Video {index + 1}: {video.file?.name || "Existing Video"}
                    </p>
                    <div className="mb-2">
                      <label className="block text-sm text-gray-400 mb-1">Video Thumbnail</label>
                      <div className="flex items-center">
                        <input
                          id={`video-thumbnail-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleVideoThumbnailChange(index, e.target.files[0])}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`video-thumbnail-${index}`).click()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                        >
                          <FaCloudUploadAlt className="mr-1" /> Upload Thumbnail
                        </button>
                        {video.thumbnail && (
                          <span className="ml-3 text-green-400 text-sm">
                            {typeof video.thumbnail === 'string'
                              ? 'Current thumbnail will be kept'
                              : `Selected: ${video.thumbnail.name}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm text-gray-400 mb-1">Video Title</label>
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => handleVideoMetaChange(index, "title", e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Video Title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Video Description</label>
                      <textarea
                        value={video.description}
                        onChange={(e) => handleVideoMetaChange(index, "description", e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Video Description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Options Tab */}
        {activeTab === "payment" && (
          <div>
            <div className="mb-4 flex items-center">
              <FaMoneyBillWave className="text-green-500 text-2xl mr-2" />
              <h3 className="text-xl font-semibold">Payment Gateways</h3>
            </div>
            <p className="text-gray-400 mb-4">Select the payment methods that will be available for this course:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className={`p-4 border rounded-lg cursor-pointer flex items-center ${courseData.paymentOptions.jazzCash ? 'border-red-500 bg-red-900 bg-opacity-20' : 'border-gray-700'}`}
                onClick={() => handlePaymentOptionChange('jazzCash')}
              >
                <FaMobileAlt className="text-red-500 text-2xl mr-3" />
                <div>
                  <h4 className="font-medium">JazzCash</h4>
                  <p className="text-sm text-gray-400">Mobile payment service</p>
                </div>
                <input
                  type="checkbox"
                  className="ml-auto"
                  checked={courseData.paymentOptions.jazzCash}
                  onChange={() => handlePaymentOptionChange('jazzCash')}
                />
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer flex items-center ${courseData.paymentOptions.easyPaisa ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-700'}`}
                onClick={() => handlePaymentOptionChange('easyPaisa')}
              >
                <FaMobileAlt className="text-green-500 text-2xl mr-3" />
                <div>
                  <h4 className="font-medium">EasyPaisa</h4>
                  <p className="text-sm text-gray-400">Mobile payment service</p>
                </div>
                <input
                  type="checkbox"
                  className="ml-auto"
                  checked={courseData.paymentOptions.easyPaisa}
                  onChange={() => handlePaymentOptionChange('easyPaisa')}
                />
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer flex items-center ${courseData.paymentOptions.payFast ? 'border-blue-500 bg-blue-900 bg-opacity-20' : 'border-gray-700'}`}
                onClick={() => handlePaymentOptionChange('payFast')}
              >
                <FaCreditCard className="text-blue-500 text-2xl mr-3" />
                <div>
                  <h4 className="font-medium">PayFast</h4>
                  <p className="text-sm text-gray-400">Credit/debit card payments</p>
                </div>
                <input
                  type="checkbox"
                  className="ml-auto"
                  checked={courseData.paymentOptions.payFast}
                  onChange={() => handlePaymentOptionChange('payFast')}
                />
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer flex items-center ${courseData.paymentOptions.bankTransfer ? 'border-gray-400 bg-gray-800' : 'border-gray-700'}`}
                onClick={() => handlePaymentOptionChange('bankTransfer')}
              >
                <FaUniversity className="text-gray-400 text-2xl mr-3" />
                <div>
                  <h4 className="font-medium">Bank Transfer</h4>
                  <p className="text-sm text-gray-400">Direct bank transfer</p>
                </div>
                <input
                  type="checkbox"
                  className="ml-auto"
                  checked={courseData.paymentOptions.bankTransfer}
                  onChange={() => handlePaymentOptionChange('bankTransfer')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {videoLoading && (
          <div className="mb-4">
            <p className="text-white mb-2">Uploading to Cloudinary: {uploadProgress}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "courseInfo" ? "videos" : activeTab === "videos" ? "payment" : "courseInfo")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition"
          >
            {activeTab === "courseInfo" ? "Next: Videos" : activeTab === "videos" ? "Next: Payment" : "Back to Info"}
          </button>

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

export default AdminCourseForm;
