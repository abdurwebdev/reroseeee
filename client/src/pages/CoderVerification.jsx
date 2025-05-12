import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaGithub, FaStackOverflow, FaLinkedin, FaGlobe, FaCode } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const programmingLanguageOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Go', 
  'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'Dart', 'Scala', 'Haskell',
  'Clojure', 'Elixir', 'R', 'MATLAB', 'Assembly', 'Perl', 'Lua', 'Groovy',
  'Objective-C', 'Shell', 'SQL', 'HTML/CSS'
];

const specializationOptions = [
  'Web Development', 'Mobile Development', 'Game Development', 'Data Science',
  'Machine Learning', 'Artificial Intelligence', 'DevOps', 'Cloud Computing',
  'Cybersecurity', 'Blockchain', 'IoT', 'Embedded Systems', 'AR/VR',
  'Quantum Computing', 'Robotics', 'Bioinformatics', 'Full Stack Development',
  'Frontend Development', 'Backend Development', 'Database Administration'
];

const CoderVerification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    programmingLanguages: [],
    yearsOfExperience: '',
    githubProfile: '',
    stackOverflowProfile: '',
    linkedInProfile: '',
    portfolioWebsite: '',
    certifications: [{ name: '', issuer: '', year: '', verificationUrl: '' }],
    codeSnippetSubmission: '',
    specializations: []
  });
  
  // Get current verification status on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/coder/verification-status', {
          withCredentials: true
        });
        
        setVerificationStatus(response.data.data.verificationStatus);
        
        // If already verified or under review, show appropriate message
        if (response.data.data.verificationStatus === 'approved') {
          toast.success('You are already verified as a professional coder!');
        } else if (response.data.data.verificationStatus === 'under_review') {
          toast.info('Your verification application is under review.');
        } else if (response.data.data.verificationStatus === 'rejected') {
          toast.error('Your previous verification application was rejected. You can apply again.');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        // If 404 or other error, user hasn't applied yet, which is fine
      }
    };
    
    checkVerificationStatus();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleLanguageChange = (language) => {
    setFormData(prev => {
      const languages = [...prev.programmingLanguages];
      if (languages.includes(language)) {
        return { ...prev, programmingLanguages: languages.filter(lang => lang !== language) };
      } else {
        return { ...prev, programmingLanguages: [...languages, language] };
      }
    });
  };
  
  const handleSpecializationChange = (specialization) => {
    setFormData(prev => {
      const specializations = [...prev.specializations];
      if (specializations.includes(specialization)) {
        return { ...prev, specializations: specializations.filter(spec => spec !== specialization) };
      } else {
        return { ...prev, specializations: [...specializations, specialization] };
      }
    });
  };
  
  const handleCertificationChange = (index, field, value) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications[index][field] = value;
    setFormData({ ...formData, certifications: updatedCertifications });
  };
  
  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [
        ...formData.certifications,
        { name: '', issuer: '', year: '', verificationUrl: '' }
      ]
    });
  };
  
  const removeCertification = (index) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications.splice(index, 1);
    setFormData({ ...formData, certifications: updatedCertifications });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.programmingLanguages.length === 0) {
      toast.error('Please select at least one programming language');
      return;
    }
    
    if (!formData.yearsOfExperience) {
      toast.error('Please enter your years of experience');
      return;
    }
    
    if (!formData.githubProfile) {
      toast.error('GitHub profile is required');
      return;
    }
    
    if (!formData.codeSnippetSubmission || formData.codeSnippetSubmission.length < 50) {
      toast.error('Please provide a substantial code snippet (at least 50 characters)');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        'http://localhost:5000/api/coder/apply',
        formData,
        { withCredentials: true }
      );
      
      toast.success('Verification application submitted successfully!');
      setVerificationStatus('under_review');
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error(error.response?.data?.message || 'Error submitting verification application');
    } finally {
      setLoading(false);
    }
  };
  
  // Render different content based on verification status
  const renderContent = () => {
    if (verificationStatus === 'approved') {
      return (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p className="font-bold">Verification Approved</p>
          <p>You are verified as a professional coder. You can now upload coding videos!</p>
          <button
            onClick={() => navigate('/upload-coding-video')}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Upload Coding Video
          </button>
        </div>
      );
    } else if (verificationStatus === 'under_review') {
      return (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p className="font-bold">Application Under Review</p>
          <p>Your professional coder verification is currently being reviewed. We'll notify you once the review is complete.</p>
        </div>
      );
    } else if (verificationStatus === 'rejected') {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Application Rejected</p>
          <p>Your previous application was rejected. You can apply again with updated information.</p>
          {/* Application form will be shown below */}
        </div>
      );
    }
    
    // Default: show nothing if not applied yet or status is 'not_applied'
    return null;
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Professional Coder Verification</h1>
        
        {renderContent()}
        
        {/* Only show the form if not already approved or under review */}
        {verificationStatus !== 'approved' && verificationStatus !== 'under_review' && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Programming Languages</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {programmingLanguageOptions.map(language => (
                  <div key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`lang-${language}`}
                      checked={formData.programmingLanguages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                      className="mr-2"
                    />
                    <label htmlFor={`lang-${language}`}>{language}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                min="0"
                max="50"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <FaGithub className="inline mr-2" />
                GitHub Profile URL
              </label>
              <input
                type="url"
                name="githubProfile"
                value={formData.githubProfile}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <FaStackOverflow className="inline mr-2" />
                Stack Overflow Profile URL (Optional)
              </label>
              <input
                type="url"
                name="stackOverflowProfile"
                value={formData.stackOverflowProfile}
                onChange={handleChange}
                placeholder="https://stackoverflow.com/users/123456/username"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <FaLinkedin className="inline mr-2" />
                LinkedIn Profile URL (Optional)
              </label>
              <input
                type="url"
                name="linkedInProfile"
                value={formData.linkedInProfile}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourusername"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <FaGlobe className="inline mr-2" />
                Portfolio Website (Optional)
              </label>
              <input
                type="url"
                name="portfolioWebsite"
                value={formData.portfolioWebsite}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Areas of Specialization</label>
              <div className="grid grid-cols-2 gap-2">
                {specializationOptions.map(specialization => (
                  <div key={specialization} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`spec-${specialization}`}
                      checked={formData.specializations.includes(specialization)}
                      onChange={() => handleSpecializationChange(specialization)}
                      className="mr-2"
                    />
                    <label htmlFor={`spec-${specialization}`}>{specialization}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Certifications (Optional)</label>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="mb-4 p-3 border border-gray-600 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Issuing Organization</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Year</label>
                      <input
                        type="number"
                        value={cert.year}
                        onChange={(e) => handleCertificationChange(index, 'year', e.target.value)}
                        min="1990"
                        max={new Date().getFullYear()}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Verification URL</label>
                      <input
                        type="url"
                        value={cert.verificationUrl}
                        onChange={(e) => handleCertificationChange(index, 'verificationUrl', e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>
                  {formData.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="mt-2 text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCertification}
                className="text-blue-400 text-sm"
              >
                + Add Another Certification
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <FaCode className="inline mr-2" />
                Code Snippet Submission
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Please provide a code snippet that demonstrates your coding skills. This could be a solution to a complex problem, an algorithm implementation, or any code you're proud of.
              </p>
              <textarea
                name="codeSnippetSubmission"
                value={formData.codeSnippetSubmission}
                onChange={handleChange}
                rows="10"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="// Paste your code here"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CoderVerification;
