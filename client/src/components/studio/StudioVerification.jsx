import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaIdCard, FaUpload } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import Spinner from '../Spinner';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudioVerification = () => {
  const [user] = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({
    documentType: 'national_id',
    documentNumber: '',
    contactPhone: '',
    contactEmail: ''
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/studio/overview`, { withCredentials: true });
        
        if (response.data.success) {
          setVerificationData(response.data.data.verification);
          
          // Pre-fill email if available
          if (user?.email) {
            setFormData(prev => ({
              ...prev,
              contactEmail: user.email
            }));
          }
        } else {
          showErrorToast('Failed to load verification data');
        }
      } catch (error) {
        console.error('Error fetching verification data:', error);
        showErrorToast(error.response?.data?.message || 'Error loading verification data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVerificationData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setDocumentPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!documentFile) {
      showErrorToast('Please upload an identity document');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('documentType', formData.documentType);
      formDataToSend.append('documentNumber', formData.documentNumber);
      formDataToSend.append('contactPhone', formData.contactPhone);
      formDataToSend.append('contactEmail', formData.contactEmail);
      formDataToSend.append('identityDocument', documentFile);
      
      const response = await axios.post(
        `${API_URL}/api/studio/verification/apply`,
        formDataToSend,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        showSuccessToast('Verification application submitted successfully');
        // Refresh data
        const updatedResponse = await axios.get(`${API_URL}/api/studio/overview`, { withCredentials: true });
        if (updatedResponse.data.success) {
          setVerificationData(updatedResponse.data.data.verification);
        }
        setShowApplicationForm(false);
      } else {
        showErrorToast('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showErrorToast(error.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Channel Verification</h1>
      
      {/* Verification Status */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Verification Status</h2>
        
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-full mr-4 ${
            user?.isVerified ? 'bg-green-600' :
            user?.verificationStatus === 'under_review' ? 'bg-yellow-600' :
            'bg-gray-600'
          }`}>
            <FaIdCard className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {user?.isVerified ? 'Channel Verified' :
               user?.verificationStatus === 'under_review' ? 'Application Under Review' :
               user?.verificationStatus === 'rejected' ? 'Application Rejected' :
               'Not Verified'}
            </h3>
            <p className="text-gray-400">
              {user?.isVerified ? 'Your channel has been verified' :
               user?.verificationStatus === 'under_review' ? 'We are reviewing your verification application' :
               user?.verificationStatus === 'rejected' ? 'Your verification application was rejected' :
               'Apply for verification to get a verified badge on your channel'}
            </p>
          </div>
        </div>
        
        {/* Benefits */}
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Benefits of Verification</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Verified badge next to your channel name</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Higher visibility in search results</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Access to additional creator features</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Protection against impersonation</span>
            </li>
          </ul>
        </div>
        
        {/* Apply button */}
        {user?.verificationStatus === 'not_applied' && (
          <button
            onClick={() => setShowApplicationForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Apply for Verification
          </button>
        )}
      </div>
      
      {/* Application Form */}
      {showApplicationForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Verification Application</h2>
          
          <form onSubmit={handleSubmitApplication}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">ID Document Type</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="national_id">National ID Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Document Number</label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Upload ID Document</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="documentFile"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                />
                
                {documentPreview ? (
                  <div className="mb-3">
                    <img 
                      src={documentPreview} 
                      alt="Document Preview" 
                      className="max-h-40 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 mb-3">
                    <FaUpload className="text-3xl mx-auto mb-2" />
                    <p>Upload your ID document (JPG, PNG, or PDF)</p>
                  </div>
                )}
                
                <label
                  htmlFor="documentFile"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer inline-block"
                >
                  {documentFile ? 'Change File' : 'Select File'}
                </label>
                
                {documentFile && (
                  <p className="mt-2 text-gray-400">
                    Selected: {documentFile.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowApplicationForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                disabled={submitting || !documentFile}
              >
                {submitting ? (
                  <>
                    <span className="mr-2">Submitting...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudioVerification;
