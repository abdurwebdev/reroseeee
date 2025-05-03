import React from 'react';

const VideoPlayer = ({ src, className = '', autoPlay = true, loop = true, muted = true }) => {
  return (
    <video
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      className={`w-full h-full object-cover ${className}`}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
