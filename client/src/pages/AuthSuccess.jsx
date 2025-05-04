import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import Spinner from '../components/Spinner';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AuthSuccess component mounted");
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    console.log("Token from URL:", token ? "Token exists" : "No token");

    if (!token) {
      console.error("No token found in URL");
      showErrorToast("Authentication failed. Please try again.");
      navigate('/login');
      return;
    }

    // Fetch user data using the token
    fetch('http://localhost:5000/api/auth/check', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(res => {
        console.log("API response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("API response data:", data);
        if (data.user) {
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify({
            ...data.user,
            token
          }));

          // Show success toast
          showSuccessToast(`Welcome, ${data.user.name}!`);
          console.log("User authenticated successfully, redirecting");

          // Redirect based on role
          if (data.user.role === 'admin') {
            navigate('/admindashboard');
          } else {
            navigate('/feed');
          }
        } else {
          console.error("No user data in API response");
          navigate('/login');
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        navigate('/login');
      });
  }, [location.search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
      <Spinner />
    </div>
  );
};

export default AuthSuccess;
