import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ items, direction = 'left', speed = 25, className = '' }) => {
  // Calculate the animation duration based on the number of items and speed
  const duration = items.length * (100 / speed);
  
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className="inline-block">
        <motion.div
          className="inline-block"
          animate={{
            x: direction === 'left' ? [0, -100 * items.length] : [-100 * items.length, 0],
          }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration,
            ease: 'linear',
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="inline-block mx-8">
              {item}
            </div>
          ))}
        </motion.div>
        <motion.div
          className="inline-block"
          animate={{
            x: direction === 'left' ? [100 * items.length, 0] : [0, 100 * items.length],
          }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration,
            ease: 'linear',
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="inline-block mx-8">
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Marquee;
