import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminWithdrawals from '../components/admin/AdminWithdrawals';
import { showErrorToast } from '../utils/toast';

const AdminWithdrawalsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/check", { 
          withCredentials: true 
        });
        
        if (res.data.user.role !== "admin") {
          showErrorToast("Only admins can access this page");
          navigate("/");
        } else {
          setAdmin(res.data.user);
          setLoading(false);
        }
      } catch (error) {
        showErrorToast("Authentication error");
        navigate("/login");
      }
    };
    
    checkAdmin();
  }, [navigate]);
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white p-6">
        <AdminWithdrawals />
      </div>
      <Footer />
    </>
  );
};

export default AdminWithdrawalsDashboard;
