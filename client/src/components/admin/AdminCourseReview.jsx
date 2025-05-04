import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEye, FaUser, FaCalendarAlt, FaVideo, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminCourseReview = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/creator-courses/pending`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setPendingCourses(response.data.courses);
      } else {
        toast.error("Failed to fetch pending courses");
      }
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      toast.error(error.response?.data?.message || "Failed to fetch pending courses");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowRejectionForm(false);
  };

  const handleApprove = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/creator-courses/${id}/approve`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success("Course approved successfully");
        fetchPendingCourses();
        setSelectedCourse(null);
      } else {
        toast.error(response.data.message || "Failed to approve course");
      }
    } catch (error) {
      console.error("Error approving course:", error);
      toast.error(error.response?.data?.message || "Failed to approve course");
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/admin/creator-courses/${id}/reject`, {
        rejectionReason
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success("Course rejected successfully");
        fetchPendingCourses();
        setSelectedCourse(null);
        setRejectionReason('');
        setShowRejectionForm(false);
      } else {
        toast.error(response.data.message || "Failed to reject course");
      }
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast.error(error.response?.data?.message || "Failed to reject course");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Course Review Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Courses List */}
        <div className="lg:col-span-1 bg-gray-900 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-yellow-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
              {pendingCourses.length}
            </span>
            Pending Courses
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="text-center py-8 bg-gray-800 rounded-lg">
              <p className="text-gray-400">No courses pending review.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {pendingCourses.map((course) => (
                <div 
                  key={course._id} 
                  className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition hover:bg-gray-700 ${
                    selectedCourse?._id === course._id ? 'border-2 border-blue-500' : ''
                  }`}
                  onClick={() => handleViewCourse(course)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      {course.image ? (
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium line-clamp-1">{course.title}</h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <FaUser className="mr-1" />
                        <span className="line-clamp-1">
                          {course.creatorId?.name || 'Unknown Creator'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <FaCalendarAlt className="mr-1" />
                        <span>{formatDate(course.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Course Details */}
        <div className="lg:col-span-2">
          {selectedCourse ? (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold">{selectedCourse.title}</h2>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(selectedCourse._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    Approve
                  </button>
                  
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Reject
                  </button>
                </div>
              </div>
              
              {showRejectionForm ? (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-2">Rejection Reason</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Please provide a reason for rejecting this course. This will be shown to the creator.
                  </p>
                  
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500 mb-3"
                    placeholder="Reason for rejection..."
                    rows="4"
                  ></textarea>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectionForm(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={() => handleReject(selectedCourse._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="aspect-video rounded-lg overflow-hidden mb-4">
                        {selectedCourse.image ? (
                          <img 
                            src={selectedCourse.image} 
                            alt={selectedCourse.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                          <FaMoneyBillWave className="text-green-500 mr-2 text-xl" />
                          <div>
                            <p className="text-sm text-gray-400">Price</p>
                            <p className="font-medium">${selectedCourse.price}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                          <FaVideo className="text-blue-500 mr-2 text-xl" />
                          <div>
                            <p className="text-sm text-gray-400">Videos</p>
                            <p className="font-medium">{selectedCourse.videos?.length || 0}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                          <FaCalendarAlt className="text-yellow-500 mr-2 text-xl" />
                          <div>
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="font-medium">{selectedCourse.duration}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                          <FaUser className="text-purple-500 mr-2 text-xl" />
                          <div>
                            <p className="text-sm text-gray-400">Instructor</p>
                            <p className="font-medium">{selectedCourse.instructor}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-medium mb-2">Creator Information</h3>
                        <div className="flex items-center mb-3">
                          {selectedCourse.creatorId?.profileImageUrl ? (
                            <img 
                              src={selectedCourse.creatorId.profileImageUrl} 
                              alt={selectedCourse.creatorId.name} 
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                              <span className="text-white font-bold">
                                {selectedCourse.creatorId?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{selectedCourse.creatorId?.name || 'Unknown Creator'}</p>
                            <p className="text-sm text-gray-400">{selectedCourse.creatorId?.email || 'No email'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p className="text-gray-300 whitespace-pre-line">{selectedCourse.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Course Videos</h3>
                    
                    {selectedCourse.videos && selectedCourse.videos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedCourse.videos.map((video, index) => (
                          <div key={index} className="bg-gray-700 rounded-lg overflow-hidden">
                            <div className="aspect-video bg-gray-900">
                              {video.thumbnail ? (
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FaVideo className="text-gray-600 text-4xl" />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium mb-1 line-clamp-1">{video.title}</h4>
                              <p className="text-sm text-gray-400 line-clamp-2">{video.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No videos available</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
              <FaEye className="text-gray-600 text-5xl mb-4" />
              <p className="text-gray-400 text-lg">Select a course to review</p>
              <p className="text-gray-500 text-sm mt-2">
                Click on a course from the list to view details and approve or reject it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseReview;
