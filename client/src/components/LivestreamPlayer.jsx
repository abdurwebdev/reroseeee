import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const LivestreamPlayer = ({ playbackUrl, autoPlay = true, muted = false, controls = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;
    
    if (videoRef.current && playbackUrl) {
      const video = videoRef.current;
      
      // Function to initialize HLS
      const initializeHls = () => {
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          
          hls.loadSource(playbackUrl);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay) {
              video.play().catch(error => {
                console.error('Error attempting to play:', error);
              });
            }
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Unrecoverable error:', data);
                  hls.destroy();
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari which has built-in HLS support
          video.src = playbackUrl;
          video.addEventListener('loadedmetadata', () => {
            if (autoPlay) {
              video.play().catch(error => {
                console.error('Error attempting to play:', error);
              });
            }
          });
        }
      };
      
      initializeHls();
    }
    
    // Cleanup function
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [playbackUrl, autoPlay]);

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg"
        controls={controls}
        muted={muted}
        playsInline
      />
    </div>
  );
};

export default LivestreamPlayer;
