import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HorizontalScroll = ({ children, className = '', speed = 0.5 }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Calculate the horizontal scroll based on vertical scroll progress
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${100 * speed}%`]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ x }}
        className="flex"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default HorizontalScroll;
