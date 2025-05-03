import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxSection = ({ 
  children, 
  backgroundImage, 
  backgroundVideo,
  overlayOpacity = 0.6,
  speed = 0.2,
  className = '' 
}) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Transform values for parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 + speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  return (
    <div 
      ref={sectionRef} 
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background layer with parallax effect */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y, scale }}
      >
        {backgroundVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <img 
            src={backgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        ) : null}
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity }}
        ></div>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ParallaxSection;
