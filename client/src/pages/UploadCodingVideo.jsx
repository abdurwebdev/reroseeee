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

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const resourceTypes = [
  { value: 'documentation', label: 'Documentation', icon: <FaBook /> },
  { value: 'github', label: 'GitHub Repository', icon: <FaGithub /> },
  { value: 'article', label: 'Article/Tutorial', icon: <FaLink /> },
  { value: 'tool', label: 'Tool/Library', icon: <FaTools /> },
  { value: 'other', label: 'Other Resource', icon: <FaLink /> }
];

const UploadCodingVideo = () => {
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
    codeSnippets: [{ language: '', code: '', description: '', startTime: '', endTime: '' }],
    resources: [{ title: '', url: '', type: 'documentation' }],
    tags: '',
    learningOutcomes: '',
    prerequisites: ''
  });

  // Files state
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Always redirect to verification page - this page should only be accessible to verified coders
  useEffect(() => {
    // Redirect to verification page immediately
    toast.info('You need to be verified as a professional coder to upload coding videos.');
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
      codeSnippets: [
        ...formData.codeSnippets,
        { language: '', code: '', description: '', startTime: '', endTime: '' }
      ]
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
      resources: [
        ...formData.resources,
        { title: '', url: '', type: 'documentation' }
      ]
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

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video file is too large. Maximum size is 500MB.');
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
      setVideoDuration(Math.round(video.duration));
    };
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Thumbnail file is too large. Maximum size is 5MB.');
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

    if (!formData.title || !formData.description) {
      toast.error('Title and description are required.');
      return;
    }

    // Validate code snippets
    const hasInvalidSnippets = formData.codeSnippets.some(snippet => {
      if (snippet.language.trim() === '' && snippet.code.trim() === '') {
        // Empty snippet is fine - we'll filter these out
        return false;
      }

      if (snippet.language.trim() === '') {
        toast.error('Each code snippet must include a language.');
        return true;
      }

      if (snippet.code.trim() === '') {
        toast.error('Each code snippet must include code content.');
        return true;
      }

      if (snippet.code.length < 10) {
        toast.error('Code snippets must be substantial (at least 10 characters).');
        return true;
      }

      return false;
    });

    if (hasInvalidSnippets) {
      return;
    }

    // Filter out empty code snippets
    const filteredCodeSnippets = formData.codeSnippets.filter(
      snippet => snippet.language.trim() !== '' && snippet.code.trim() !== ''
    );

    try {
      setLoading(true);

      // Create FormData object
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);

      try {
        // Safely stringify arrays and objects
        submitData.append('programmingLanguages', JSON.stringify(formData.programmingLanguages));

        // Simplify the code snippets to avoid JSON issues
        const simplifiedCodeSnippets = filteredCodeSnippets.map(snippet => ({
          language: snippet.language.trim(),
          code: snippet.code,
          description: snippet.description || '',
          startTime: snippet.startTime || 0,
          endTime: snippet.endTime || 0
        }));
        submitData.append('codeSnippets', JSON.stringify(simplifiedCodeSnippets));

        // Simplify resources to avoid JSON issues
        const simplifiedResources = formData.resources.map(resource => ({
          title: resource.title || '',
          url: resource.url || '',
          type: resource.type || 'documentation'
        }));
        submitData.append('resources', JSON.stringify(simplifiedResources));
      } catch (error) {
        console.error('JSON stringify error:', error);
        toast.error('Error processing form data. Please try again with simpler input.');
        setLoading(false);
        return;
      }

      // Add remaining simple fields
      submitData.append('frameworks', formData.frameworks);
      submitData.append('difficultyLevel', formData.difficultyLevel);
      submitData.append('tags', formData.tags);
      submitData.append('learningOutcomes', formData.learningOutcomes);
      submitData.append('prerequisites', formData.prerequisites);
      submitData.append('duration', videoDuration || 0);
      submitData.append('video', videoFile);
      submitData.append('thumbnail', thumbnailFile);

      const response = await axios.post(
        'http://localhost:5000/api/coding-videos/upload',
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      toast.success('Coding video uploaded successfully!');

      // Redirect to the video page
      setTimeout(() => {
        navigate(`/coding-videos/${response.data.data._id}`);
      }, 2000);
    } catch (error) {
      console.error('Error uploading coding video:', error);
      toast.error(error.response?.data?.message || 'Error uploading coding video');
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
          <h1 className="text-3xl font-bold mb-6">Upload Coding Video</h1>
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
        <h1 className="text-3xl font-bold mb-6 text-center">Upload Coding Video</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Video Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe what your video teaches and why it's valuable"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Programming Languages</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-700 border border-gray-600 rounded-lg">
                  {programmingLanguageOptions.map(language => (
                    <div key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`lang-${language}`}
                        checked={formData.programmingLanguages.includes(language)}
                        onChange={() => handleLanguageChange(language)}
                        className="mr-2"
                      />
                      <label htmlFor={`lang-${language}`} className="text-sm">{language}</label>
                    </div>
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
                  placeholder="React, Django, TensorFlow, etc. (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
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
                  placeholder="web, algorithm, tutorial, etc. (comma separated)"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Video File</label>
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <div
                  onClick={() => videoInputRef.current.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 transition-colors"
                >
                  {videoPreview ? (
                    <video src={videoPreview} className="h-full rounded-lg" controls />
                  ) : (
                    <div className="text-center">
                      <FaPlus className="mx-auto text-2xl mb-2" />
                      <p>Click to upload video</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, WebM, or QuickTime (max 500MB)</p>
                    </div>
                  )}
                </div>
                {videoDuration > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Duration: {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, '0')}
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

              <div>
                <label className="block text-sm font-medium mb-1">Learning Outcomes</label>
                <textarea
                  name="learningOutcomes"
                  value={formData.learningOutcomes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What will viewers learn from this video? (one per line)"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Prerequisites</label>
                <textarea
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What should viewers already know? (one per line)"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Code Snippets Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <FaCode className="mr-2" /> Code Snippets
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Add code snippets that appear in your video. Each snippet must include a programming language and code content.
              Fields marked with <span className="text-red-500">*</span> are required.
            </p>

            {formData.codeSnippets.map((snippet, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Snippet #{index + 1}</h4>
                  {formData.codeSnippets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCodeSnippet(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                {/* Simplified form with only the essential fields */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Language <span className="text-red-500">*</span></label>
                  <select
                    value={snippet.language}
                    onChange={(e) => handleCodeSnippetChange(index, 'language', e.target.value)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg"
                    required
                  >
                    <option value="">Select a language</option>
                    {programmingLanguageOptions.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={snippet.description}
                    onChange={(e) => handleCodeSnippetChange(index, 'description', e.target.value)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg"
                    placeholder="What this code does"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Code <span className="text-red-500">*</span></label>
                  <textarea
                    value={snippet.code}
                    onChange={(e) => handleCodeSnippetChange(index, 'code', e.target.value)}
                    rows="6"
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg font-mono text-sm"
                    placeholder="Paste your code here (minimum 10 characters)"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time (seconds)</label>
                    <input
                      type="number"
                      value={snippet.startTime}
                      onChange={(e) => handleCodeSnippetChange(index, 'startTime', e.target.value)}
                      min="0"
                      max={videoDuration || 3600}
                      className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">End Time (seconds)</label>
                    <input
                      type="number"
                      value={snippet.endTime}
                      onChange={(e) => handleCodeSnippetChange(index, 'endTime', e.target.value)}
                      min="0"
                      max={videoDuration || 3600}
                      className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg"
                      placeholder="60"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addCodeSnippet}
              className="flex items-center text-green-400 hover:text-green-300"
            >
              <FaPlus className="mr-1" /> Add Another Code Snippet
            </button>
          </div>

          {/* Resources Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaLink className="mr-2" /> Additional Resources
            </h3>

            {formData.resources.map((resource, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Resource #{index + 1}</h4>
                  {formData.resources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={resource.title}
                      onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                      className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg"
                      placeholder="Resource title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                      className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">Resource Type</label>
                  <select
                    value={resource.type}
                    onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg"
                  >
                    {resourceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addResource}
              className="flex items-center text-green-400 hover:text-green-300"
            >
              <FaPlus className="mr-1" /> Add Another Resource
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 mt-8"
          >
            {loading ? 'Uploading...' : 'Upload Coding Video'}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default UploadCodingVideo;
