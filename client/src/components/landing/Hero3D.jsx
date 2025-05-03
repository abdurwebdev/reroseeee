import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';

const Hero3D = ({ 
  title, 
  subtitle, 
  backgroundVideo,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  className = '' 
}) => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  
  // 3D mouse movement effect
  useEffect(() => {
    if (!heroRef.current || !titleRef.current) return;
    
    const hero = heroRef.current;
    const title = titleRef.current;
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 20;
      const y = (clientY - window.innerHeight / 2) / 20;
      
      gsap.to(title, {
        rotationY: x * 0.5,
        rotationX: -y * 0.5,
        transformPerspective: 1000,
        ease: 'power2.out',
        duration: 0.5
      });
    };
    
    hero.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <motion.div 
      ref={heroRef}
      style={{ opacity, scale }}
      className={`relative h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 z-10 text-center">
        <motion.div
          ref={titleRef}
          style={{ y }}
          className="transform-gpu"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white"
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {primaryButtonText && (
              <a 
                href={primaryButtonLink} 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                {primaryButtonText}
              </a>
            )}
            
            {secondaryButtonText && (
              <a 
                href={secondaryButtonLink} 
                className="px-8 py-4 bg-transparent border-2 border-white rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
              >
                {secondaryButtonText}
              </a>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </motion.div>
  );
};

export default Hero3D;
