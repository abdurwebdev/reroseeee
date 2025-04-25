// components/UploadVideo.js
import React, { useState } from 'react';
import axios from 'axios';

const UploadVideo = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnailFile);

    try {
      await axios.post('/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Error uploading video');
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Video/Short</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="video">Video</option>
          <option value="short">Short</option>
        </select>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadVideo;