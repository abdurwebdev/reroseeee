import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StudioSidebar from '../components/studio/StudioSidebar';
import { showErrorToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CreatorStudio = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/check`, { withCredentials: true });
        
        if (response.data.user) {
          setUser(response.data.user);
          
          // Check if user is a creator
          if (response.data.user.role !== 'creator' && response.data.user.role !== 'admin') {
            showErrorToast('You need a creator account to access the Studio');
            navigate('/dashboard');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white">
        <div className="flex">
          {/* Sidebar */}
          <StudioSidebar user={user} />
          
          {/* Main content */}
          <div className="flex-1 p-6">
            <Outlet context={[user, setUser]} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreatorStudio;
