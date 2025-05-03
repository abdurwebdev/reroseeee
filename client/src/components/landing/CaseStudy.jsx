import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CaseStudy = ({ 
  title, 
  description, 
  image, 
  category,
  link = '#',
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <a href={link} className="block">
        {/* Image with zoom effect on hover */}
        <div className="overflow-hidden aspect-video">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 flex flex-col justify-end">
          <div className="transform transition-transform duration-300" style={{ transform: isHovered ? 'translateY(-20px)' : 'translateY(0)' }}>
            <span className="text-sm text-blue-400 font-medium mb-2 inline-block">{category}</span>
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            
            {/* Description that appears on hover */}
            <motion.p 
              className="text-gray-300 text-sm"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>
          </div>
          
          {/* Arrow that appears on hover */}
          <motion.div 
            className="absolute bottom-6 right-6"
            animate={{ 
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : -20
            }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </motion.div>
        </div>
      </a>
    </motion.div>
  );
};

export default CaseStudy;
