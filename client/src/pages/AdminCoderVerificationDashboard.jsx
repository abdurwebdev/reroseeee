import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaCode, FaGithub, FaLinkedin, FaGlobe, FaStackOverflow } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminCoderVerificationDashboard = () => {
  const [pendingApplications, setPendingApplications] = useState([]);
  const [verifiedCoders, setVerifiedCoders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'pending') {
        const response = await axios.get('http://localhost:5000/api/coder/pending-applications', {
          withCredentials: true
        });
        setPendingApplications(response.data.data);
      } else {
        const response = await axios.get('http://localhost:5000/api/coder/verified-coders', {
          withCredentials: true
        });
        setVerifiedCoders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications. Please try again later.');
      toast.error('Failed to load coder applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (userId, status) => {
    try {
      const data = {
        status,
        notes: status === 'rejected' ? rejectionReason : 'Application approved'
      };

      await axios.put(`http://localhost:5000/api/coder/review/${userId}`, data, {
        withCredentials: true
      });

      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setRejectionReason('');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    }
  };

  const openModal = (application, action) => {
    setSelectedApplication(application);
    setModalAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setRejectionReason('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Coder Verification Dashboard</h1>
          <Link to="/admindashboard" className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            Back to Admin Dashboard
          </Link>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Applications
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'verified' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('verified')}
          >
            Verified Coders
          </button>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg">
            {error}
          </div>
        ) : activeTab === 'pending' ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Pending Applications ({pendingApplications.length})</h2>
            {pendingApplications.length === 0 ? (
              <p className="text-gray-400">No pending applications at this time.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingApplications.map(application => (
                  <div key={application._id} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{application.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{application.email}</p>
                      
                      <div className="mb-3">
                        <div className="flex items-center text-sm mb-1">
                          <span className="font-medium mr-2">Experience:</span>
                          <span>{application.yearsOfExperience} years</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium mr-2">Languages:</span>
                          <div className="flex flex-wrap gap-1">
                            {application.programmingLanguages.map((lang, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {application.githubProfile && (
                          <a
                            href={application.githubProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-full hover:bg-gray-600"
                          >
                            <FaGithub className="mr-1" /> GitHub
                          </a>
                        )}
                        {application.stackOverflowProfile && (
                          <a
                            href={application.stackOverflowProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-full hover:bg-gray-600"
                          >
                            <FaStackOverflow className="mr-1" /> Stack Overflow
                          </a>
                        )}
                        {application.linkedInProfile && (
                          <a
                            href={application.linkedInProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-full hover:bg-gray-600"
                          >
                            <FaLinkedin className="mr-1" /> LinkedIn
                          </a>
                        )}
                        {application.portfolioWebsite && (
                          <a
                            href={application.portfolioWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-full hover:bg-gray-600"
                          >
                            <FaGlobe className="mr-1" /> Portfolio
                          </a>
                        )}
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => openModal(application, 'view')}
                          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(application, 'approve')}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center"
                          >
                            <FaCheck className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => openModal(application, 'reject')}
                            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center"
                          >
                            <FaTimes className="mr-1" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Verified Coders ({verifiedCoders.length})</h2>
            {verifiedCoders.length === 0 ? (
              <p className="text-gray-400">No verified coders at this time.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Languages</th>
                      <th className="px-4 py-3 text-left">Experience</th>
                      <th className="px-4 py-3 text-left">Verified On</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {verifiedCoders.map(coder => (
                      <tr key={coder._id} className="hover:bg-gray-750">
                        <td className="px-4 py-3">{coder.name}</td>
                        <td className="px-4 py-3">{coder.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {coder.programmingLanguages.slice(0, 3).map((lang, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                                {lang}
                              </span>
                            ))}
                            {coder.programmingLanguages.length > 3 && (
                              <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                                +{coder.programmingLanguages.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{coder.yearsOfExperience} years</td>
                        <td className="px-4 py-3">{new Date(coder.coderVerificationDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openModal(coder, 'view')}
                            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {modalAction === 'approve' ? 'Approve Application' : 
                   modalAction === 'reject' ? 'Reject Application' : 
                   'Application Details'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>
              
              {modalAction === 'view' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-400">Name</h3>
                      <p>{selectedApplication.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-400">Email</h3>
                      <p>{selectedApplication.email}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-400">Experience</h3>
                      <p>{selectedApplication.yearsOfExperience} years</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-400">Programming Languages</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApplication.programmingLanguages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-400 mb-2">Profiles</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedApplication.githubProfile && (
                        <a
                          href={selectedApplication.githubProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-gray-700 px-3 py-2 rounded hover:bg-gray-600"
                        >
                          <FaGithub className="mr-2" /> GitHub Profile
                        </a>
                      )}
                      {selectedApplication.stackOverflowProfile && (
                        <a
                          href={selectedApplication.stackOverflowProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-gray-700 px-3 py-2 rounded hover:bg-gray-600"
                        >
                          <FaStackOverflow className="mr-2" /> Stack Overflow Profile
                        </a>
                      )}
                      {selectedApplication.linkedInProfile && (
                        <a
                          href={selectedApplication.linkedInProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-gray-700 px-3 py-2 rounded hover:bg-gray-600"
                        >
                          <FaLinkedin className="mr-2" /> LinkedIn Profile
                        </a>
                      )}
                      {selectedApplication.portfolioWebsite && (
                        <a
                          href={selectedApplication.portfolioWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-gray-700 px-3 py-2 rounded hover:bg-gray-600"
                        >
                          <FaGlobe className="mr-2" /> Portfolio Website
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {selectedApplication.codeSnippetSubmission && (
                    <div>
                      <h3 className="font-medium text-gray-400 mb-2">Code Snippet Submission</h3>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                        {selectedApplication.codeSnippetSubmission}
                      </pre>
                    </div>
                  )}
                  
                  {activeTab === 'pending' && (
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => openModal(selectedApplication, 'approve')}
                        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center"
                      >
                        <FaCheck className="mr-2" /> Approve
                      </button>
                      <button
                        onClick={() => openModal(selectedApplication, 'reject')}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center"
                      >
                        <FaTimes className="mr-2" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {modalAction === 'approve' && (
                <div>
                  <p className="mb-4">
                    Are you sure you want to approve this application? This will grant the user professional coder status and allow them to upload coding videos.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReviewAction(selectedApplication._id, 'approved')}
                      className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                      Confirm Approval
                    </button>
                  </div>
                </div>
              )}
              
              {modalAction === 'reject' && (
                <div>
                  <p className="mb-4">
                    Please provide a reason for rejecting this application:
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg mb-4"
                    rows="4"
                    placeholder="Reason for rejection"
                    required
                  ></textarea>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReviewAction(selectedApplication._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default AdminCoderVerificationDashboard;
