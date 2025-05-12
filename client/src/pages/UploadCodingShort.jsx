import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCode, FaPlus, FaTrash, FaLink, FaGithub, FaBook, FaTools } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const programmingLanguageOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Go',
  'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'Dart', 'Scala', 'Haskell',
  'Clojure', 'Elixir', 'R', 'MATLAB', 'Assembly', 'Perl', 'Lua', 'Groovy',
  'Objective-C', 'Shell', 'SQL', 'HTML/CSS'
];

const UploadCodingShort = () => {
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    programmingLanguages: [],
    frameworks: '',
    difficultyLevel: 'intermediate',
    codeSnippets: [{ language: '', code: '', description: '' }],
    resources: [{ title: '', url: '', type: 'documentation' }],
    tags: ''
  });

  // Files state
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Always redirect to verification page - this page should only be accessible to verified coders
  useEffect(() => {
    // Redirect to verification page immediately
    toast.info('You need to be verified as a professional coder to upload coding shorts.');
    navigate('/coder-verification');
  }, [navigate]);

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

  const handleCodeSnippetChange = (index, field, value) => {
    const updatedSnippets = [...formData.codeSnippets];
    updatedSnippets[index][field] = value;
    setFormData({ ...formData, codeSnippets: updatedSnippets });
  };

  const addCodeSnippet = () => {
    setFormData({
      ...formData,
      codeSnippets: [...formData.codeSnippets, { language: '', code: '', description: '' }]
    });
  };

  const removeCodeSnippet = (index) => {
    const updatedSnippets = [...formData.codeSnippets];
    updatedSnippets.splice(index, 1);
    setFormData({ ...formData, codeSnippets: updatedSnippets });
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = [...formData.resources];
    updatedResources[index][field] = value;
    setFormData({ ...formData, resources: updatedResources });
  };

  const addResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, { title: '', url: '', type: 'documentation' }]
    });
  };

  const removeResource = (index) => {
    const updatedResources = [...formData.resources];
    updatedResources.splice(index, 1);
    setFormData({ ...formData, resources: updatedResources });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 100MB for shorts)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file is too large. Maximum size for shorts is 100MB.');
      return;
    }

    setVideoFile(file);

    // Create video preview
    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);

    // Get video duration
    const video = document.createElement('video');
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      setVideoDuration(duration);

      // Check if video is too long for a short (max 60 seconds)
      if (duration > 60) {
        toast.warning('This video is longer than 60 seconds. Consider uploading it as a regular coding video instead.');
      }
    };
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Thumbnail image is too large. Maximum size is 5MB.');
      return;
    }

    setThumbnailFile(file);

    // Create thumbnail preview
    const thumbnailUrl = URL.createObjectURL(file);
    setThumbnailPreview(thumbnailUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!videoFile || !thumbnailFile) {
      toast.error('Please upload both a video file and a thumbnail image.');
      return;
    }

    if (formData.programmingLanguages.length === 0) {
      toast.error('Please select at least one programming language.');
      return;
    }

    if (!formData.title) {
      toast.error('Title is required.');
      return;
    }

    // Check if video is too long for a short
    if (videoDuration > 60) {
      if (!window.confirm('This video is longer than 60 seconds. Are you sure you want to upload it as a short?')) {
        return;
      }
    }

    setLoading(true);

    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description || formData.title);

      // Add programming languages as JSON string
      submitData.append('programmingLanguages', JSON.stringify(formData.programmingLanguages));

      // Add code snippets if any
      const filteredCodeSnippets = formData.codeSnippets.filter(
        snippet => snippet.language.trim() && snippet.code.trim()
      );

      if (filteredCodeSnippets.length > 0) {
        submitData.append('codeSnippets', JSON.stringify(filteredCodeSnippets));
      }

      // Add resources if any
      const filteredResources = formData.resources.filter(
        resource => resource.title.trim() && resource.url.trim()
      );

      if (filteredResources.length > 0) {
        submitData.append('resources', JSON.stringify(filteredResources));
      }

      // Add remaining simple fields
      submitData.append('frameworks', formData.frameworks);
      submitData.append('difficultyLevel', formData.difficultyLevel);
      submitData.append('tags', formData.tags);
      submitData.append('duration', videoDuration || 0);
      submitData.append('video', videoFile);
      submitData.append('thumbnail', thumbnailFile);

      const response = await axios.post(
        'http://localhost:5000/api/coding-videos/upload-short',
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      toast.success('Coding short uploaded successfully!');

      // Redirect to the video page
      setTimeout(() => {
        navigate(`/coding-videos/${response.data.data._id}`);
      }, 2000);
    } catch (error) {
      console.error('Error uploading coding short:', error);
      toast.error(error.response?.data?.message || 'Error uploading coding short');
    } finally {
      setLoading(false);
    }
  };

  // If not verified, don't render the form
  if (verificationStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-6">Upload Coding Short</h1>
          <p>Checking verification status...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload Coding Short</h1>
        <p className="text-center text-gray-400 mb-6">
          Shorts are vertical videos up to 60 seconds long that showcase quick coding tips, tricks, or concepts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Short Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter a catchy title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Briefly describe what this short demonstrates"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Programming Languages</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {programmingLanguageOptions.map(language => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleLanguageChange(language)}
                      className={`px-3 py-1 rounded-full text-sm ${formData.programmingLanguages.includes(language)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frameworks/Libraries</label>
                <input
                  type="text"
                  name="frameworks"
                  value={formData.frameworks}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="React, Vue, Django, etc. (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="tutorial, tip, algorithm, etc. (comma separated)"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Video File (Max 60 seconds)</label>
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <div
                  onClick={() => videoInputRef.current.click()}
                  className="w-full h-64 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
                >
                  {videoPreview ? (
                    <video src={videoPreview} className="h-full rounded-lg" controls />
                  ) : (
                    <div className="text-center">
                      <FaPlus className="mx-auto text-2xl mb-2" />
                      <p>Click to upload short video</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, WebM, or QuickTime (max 100MB)</p>
                      <p className="text-xs text-gray-400 mt-1">Vertical format recommended (9:16)</p>
                    </div>
                  )}
                </div>
                {videoDuration > 0 && (
                  <p className="text-sm mt-1">
                    Duration: {videoDuration} seconds
                    {videoDuration > 60 && (
                      <span className="text-yellow-500 ml-2">
                        (Warning: Shorts should be 60 seconds or less)
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <div
                  onClick={() => thumbnailInputRef.current.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full rounded-lg object-contain" />
                  ) : (
                    <div className="text-center">
                      <FaPlus className="mx-auto text-2xl mb-2" />
                      <p>Click to upload thumbnail</p>
                      <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Snippets Section (Simplified for shorts) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Code Snippet</label>
                  {formData.codeSnippets.length < 2 && (
                    <button
                      type="button"
                      onClick={addCodeSnippet}
                      className="text-sm text-green-500 hover:text-green-400 flex items-center"
                    >
                      <FaPlus className="mr-1" /> Add Snippet
                    </button>
                  )}
                </div>

                {formData.codeSnippets.map((snippet, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Snippet {index + 1}</h4>
                      {formData.codeSnippets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCodeSnippet(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={snippet.language}
                      onChange={(e) => handleCodeSnippetChange(index, 'language', e.target.value)}
                      className="w-full p-2 mb-2 bg-gray-600 text-white border border-gray-500 rounded-lg"
                      placeholder="Language (e.g., JavaScript, Python)"
                    />

                    <textarea
                      value={snippet.code}
                      onChange={(e) => handleCodeSnippetChange(index, 'code', e.target.value)}
                      className="w-full p-2 mb-2 bg-gray-600 text-white border border-gray-500 rounded-lg font-mono"
                      placeholder="Paste your code here"
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Coding Short"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default UploadCodingShort;
