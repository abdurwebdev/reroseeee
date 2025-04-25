import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShortsFeed = () => {
  const [shorts, setShorts] = useState([]);
  const [currentShort, setCurrentShort] = useState(0);

  useEffect(() => {
    axios.get('/api/shorts').then(res => setShorts(res.data));
  }, []);

  const handleLike = (id) => axios.post(`/api/short/${id}/like`);
  const handleDislike = (id) => axios.post(`/api/short/${id}/dislike`);
  const handleComment = (id, text) => axios.post(`/api/short/${id}/comment`, { text });

  return (
    <div style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
      {shorts.map((short, index) => (
        <div key={short._id} style={{ height: '100vh', scrollSnapAlign: 'start' }}>
          <video src={short.videoUrl} controls style={{ width: '100%', height: '80%' }} />
          <div>
            <button onClick={() => handleLike(short._id)}>Likes: {short.likes.length}</button>
            <button onClick={() => handleDislike(short._id)}>Dislikes: {short.dislikes.length}</button>
            <p>Views: {short.views}</p>
            <div>
              {short.comments.map(comment => (
                <p key={comment._id}>{comment.text} - {comment.userId.username}</p>
              ))}
              <input type="text" onKeyPress={(e) => e.key === 'Enter' && handleComment(short._id, e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;