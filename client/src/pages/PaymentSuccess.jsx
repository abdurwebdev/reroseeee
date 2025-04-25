import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = ({ courseId }) => {
  console.log(courseId);
  
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">Payment Successful!</h1>
      <p className="text-lg mt-4">Thank you for purchasing the course.</p>
      <p className="text-lg mt-4">You can now access the course videos and start learning!</p>

      <Link to={`/course-videos/${courseId}`}>Go to Course</Link>
    </div>
  );
};

export default PaymentSuccess;
