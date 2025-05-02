import React from 'react';
import { FaMobileAlt, FaCreditCard, FaUniversity, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const CourseListItem = ({ course, onEdit, onDelete, onView }) => {
  return (
    <li className="p-4 border rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111111] mb-4">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
        {course.image && (
          <img
            src={course.image.startsWith('http') ? course.image : `http://localhost:5000${course.image}`}
            alt={course.title}
            className="w-full md:w-24 h-40 md:h-24 object-cover rounded"
          />
        )}
        <div>
          <h3 className="text-xl text-white font-semibold">{course.title}</h3>
          <p className="text-gray-300 text-sm">{course.description.substring(0, 100)}...</p>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <p className="text-white text-sm">Price: ₨{course.price}</p>
            <p className="text-white text-sm">Instructor: {course.instructor}</p>
            <p className="text-white text-sm">Duration: {course.duration}</p>
            <p className="text-white text-sm">Category: {course.category}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {course.paymentOptions?.jazzCash && (
              <span className="bg-red-900 bg-opacity-30 text-red-400 text-xs px-2 py-1 rounded flex items-center">
                <FaMobileAlt className="mr-1" /> JazzCash
              </span>
            )}
            {course.paymentOptions?.easyPaisa && (
              <span className="bg-green-900 bg-opacity-30 text-green-400 text-xs px-2 py-1 rounded flex items-center">
                <FaMobileAlt className="mr-1" /> EasyPaisa
              </span>
            )}
            {course.paymentOptions?.payFast && (
              <span className="bg-blue-900 bg-opacity-30 text-blue-400 text-xs px-2 py-1 rounded flex items-center">
                <FaCreditCard className="mr-1" /> PayFast
              </span>
            )}
            {course.paymentOptions?.bankTransfer && (
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded flex items-center">
                <FaUniversity className="mr-1" /> Bank Transfer
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(course._id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
        >
          <FaEye className="mr-1" /> View
        </button>
        <button
          onClick={() => onEdit(course)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded flex items-center"
        >
          <FaEdit className="mr-1" /> Edit
        </button>
        <button
          onClick={() => onDelete(course._id)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center"
        >
          <FaTrash className="mr-1" /> Delete
        </button>
      </div>
    </li>
  );
};

export default CourseListItem;
