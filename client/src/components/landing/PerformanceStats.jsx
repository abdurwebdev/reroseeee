import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const PerformanceStats = ({ stats, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <StatItem 
          key={index}
          value={stat.value}
          label={stat.label}
          suffix={stat.suffix}
          color={stat.color}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

const StatItem = ({ value, label, suffix = '', color = 'text-blue-500', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = value / (duration / 16); // 60fps
      
      const timer = setInterval(() => {
        start += increment;
        if (start > value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className={`text-4xl font-bold ${color}`}>
        {displayValue}{suffix}
      </div>
      <p className="text-gray-400 mt-2">{label}</p>
    </motion.div>
  );
};

export default PerformanceStats;
