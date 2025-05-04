import React from 'react';
import AdminCourseReview from './AdminCourseReview';

const AdminCourseReviewDashboard = ({ user }) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Course Review Dashboard</h1>
        <p className="text-gray-400">Review and approve creator courses</p>
      </div>
      
      <AdminCourseReview />
    </div>
  );
};

export default AdminCourseReviewDashboard;
