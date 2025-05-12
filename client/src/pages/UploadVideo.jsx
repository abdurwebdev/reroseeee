// pages/UploadVideo.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { showSuccessToast, showErrorToast, showWarningToast } from "../utils/toast";
import { FaPlus, FaTrash } from "react-icons/fa";

const UploadVideo = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [programmingLanguages, setProgrammingLanguages] = useState("");
  const [frameworks, setFrameworks] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("beginner");
  const [tags, setTags] = useState("");
  const [codeSnippets, setCodeSnippets] = useState([{ language: "", code: "", description: "" }]);
  const [resources, setResources] = useState([{ title: "", url: "", type: "documentation" }]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setError("You must be logged in to upload a video.");
    }
  }, []);

  // Handle code snippet changes
  const handleCodeSnippetChange = (index, field, value) => {
    const updatedSnippets = [...codeSnippets];
    updatedSnippets[index][field] = value;
    setCodeSnippets(updatedSnippets);
  };

  // Add a new code snippet
  const addCodeSnippet = () => {
    setCodeSnippets([...codeSnippets, { language: "", code: "", description: "" }]);
  };

  // Remove a code snippet
  const removeCodeSnippet = (index) => {
    const updatedSnippets = [...codeSnippets];
    updatedSnippets.splice(index, 1);
    setCodeSnippets(updatedSnippets);
  };

  // Handle resource changes
  const handleResourceChange = (index, field, value) => {
    const updatedResources = [...resources];
    updatedResources[index][field] = value;
    setResources(updatedResources);
  };

  // Add a new resource
  const addResource = () => {
    setResources([...resources, { title: "", url: "", type: "documentation" }]);
  };

  // Remove a resource
  const removeResource = (index) => {
    const updatedResources = [...resources];
    updatedResources.splice(index, 1);
    setResources(updatedResources);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in to upload a video.");
      showWarningToast("Please log in to upload a video.");
      return;
    }

    if (!videoFile || !thumbnailFile || !title.trim()) {
      setError("Please fill in all required fields.");
      showWarningToast("Please fill in all required fields.");
      return;
    }

    // Validate programming languages
    if (!programmingLanguages.trim()) {
      setError("Please specify at least one programming language.");
      showWarningToast("Please specify at least one programming language.");
      return;
    }

    // Filter out empty code snippets
    const filteredCodeSnippets = codeSnippets.filter(
      snippet => snippet.language.trim() && snippet.code.trim()
    );

    // Filter out empty resources
    const filteredResources = resources.filter(
      resource => resource.title.trim() && resource.url.trim()
    );

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("uploader", user.name);
    formData.append("type", "video");
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnailFile);
    formData.append("programmingLanguages", programmingLanguages);
    formData.append("frameworks", frameworks);
    formData.append("difficultyLevel", difficultyLevel);
    formData.append("tags", tags);

    // Add code snippets and resources as JSON strings
    if (filteredCodeSnippets.length > 0) {
      formData.append("codeSnippets", JSON.stringify(filteredCodeSnippets));
    }

    if (filteredResources.length > 0) {
      formData.append("resources", JSON.stringify(filteredResources));
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.post("http://localhost:5000/api/free-videos/upload-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setSuccess("🎉 Video uploaded successfully!");
      showSuccessToast("Video uploaded successfully! It will appear in your feed shortly.");

      // Reset form
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setProgrammingLanguages("");
      setFrameworks("");
      setDifficultyLevel("beginner");
      setTags("");
      setCodeSnippets([{ language: "", code: "", description: "" }]);
      setResources([{ title: "", url: "", type: "documentation" }]);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "An error occurred during upload.";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <Navbar />
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Upload a Coding Video</h2>
        <p className="text-gray-400 mb-6">Share your coding knowledge with the community. Only coding-related videos are allowed on this platform.</p>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {success && (
          <div className="mb-4">
            <p className="text-green-500">{success}</p>
            <Link to="/feed" className="text-blue-400 hover:underline">
              Go to Feed
            </Link>
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter coding video title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe what this coding video teaches"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Programming Languages *</label>
                  <input
                    type="text"
                    value={programmingLanguages}
                    onChange={(e) => setProgrammingLanguages(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="JavaScript, Python, etc. (comma separated)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Frameworks/Libraries</label>
                  <input
                    type="text"
                    value={frameworks}
                    onChange={(e) => setFrameworks(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="React, Django, etc. (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Difficulty Level</label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="tutorial, algorithm, web development (comma separated)"
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Video File *</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Thumbnail Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                    required
                  />
                </div>

                {/* Code Snippets Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Code Snippets</label>
                    <button
                      type="button"
                      onClick={addCodeSnippet}
                      className="text-sm text-green-500 hover:text-green-400 flex items-center"
                    >
                      <FaPlus className="mr-1" /> Add Snippet
                    </button>
                  </div>

                  {codeSnippets.map((snippet, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-300">Snippet {index + 1}</h4>
                        {codeSnippets.length > 1 && (
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
                        className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                        placeholder="Language (e.g., JavaScript, Python)"
                      />

                      <textarea
                        value={snippet.code}
                        onChange={(e) => handleCodeSnippetChange(index, 'code', e.target.value)}
                        className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-600 rounded-lg font-mono"
                        placeholder="Paste your code here"
                        rows={3}
                      />

                      <input
                        type="text"
                        value={snippet.description}
                        onChange={(e) => handleCodeSnippetChange(index, 'description', e.target.value)}
                        className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                        placeholder="Brief description of this code snippet"
                      />
                    </div>
                  ))}
                </div>

                {/* Resources Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Additional Resources</label>
                    <button
                      type="button"
                      onClick={addResource}
                      className="text-sm text-green-500 hover:text-green-400 flex items-center"
                    >
                      <FaPlus className="mr-1" /> Add Resource
                    </button>
                  </div>

                  {resources.map((resource, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-300">Resource {index + 1}</h4>
                        {resources.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResource(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={resource.title}
                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                        className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                        placeholder="Resource title"
                      />

                      <input
                        type="url"
                        value={resource.url}
                        onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                        className="w-full p-2 mb-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                        placeholder="URL (https://...)"
                      />

                      <select
                        value={resource.type}
                        onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                        className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg"
                      >
                        <option value="documentation">Documentation</option>
                        <option value="github">GitHub Repository</option>
                        <option value="article">Article</option>
                        <option value="tool">Tool</option>
                        <option value="other">Other</option>
                      </select>
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
                {loading ? "Uploading..." : "Upload Coding Video"}
              </button>
              <p className="mt-2 text-xs text-gray-400">* Required fields</p>
            </div>
          </form>
        ) : (
          <p className="text-gray-400">
            Please{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              log in
            </Link>{" "}
            to upload a coding video.
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UploadVideo;
