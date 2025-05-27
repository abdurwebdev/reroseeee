import React, { useEffect, useState } from 'react';
import { FaTrash, FaPlay, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Utility to get downloads from localStorage
const getDownloads = () => {
  const data = localStorage.getItem('downloads');
  return data ? JSON.parse(data) : [];
};

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [playing, setPlaying] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setDownloads(getDownloads());
  }, []);

  const handleDelete = (id) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('downloads', JSON.stringify(updated));
  };

  const handlePlay = (id) => {
    navigate(`/watch-download/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">My Downloads</h1>
      {downloads.length === 0 ? (
        <p className="text-gray-400">No downloads yet.</p>
      ) : (
        <div className="space-y-6">
          {downloads.map((item) => (
            <div key={item.id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaDownload className="text-blue-400 text-2xl" />
                <div>
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-gray-400 text-sm">{item.channel || 'Unknown Channel'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
                  onClick={() => handlePlay(item.id)}
                >
                  <FaPlay className="mr-2" /> Watch
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center"
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {playing && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg relative max-w-2xl w-full">
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setPlaying(null)}
            >
              &times;
            </button>
            <video src={playing} controls autoPlay className="w-full rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Downloads;
