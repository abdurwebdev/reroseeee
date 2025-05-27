import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const AdminAuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminAuthSuccess component mounted");
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
          // Verify this is the specific admin email
          if (data.user.email === 'iabdurrehman12345@gmail.com') {
            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify({
              ...data.user,
              token
            }));

            // Show success toast
            showSuccessToast(`Welcome Admin, ${data.user.name}!`);
            console.log("Admin authenticated successfully, redirecting to dashboard");

            // Redirect to admin dashboard
            navigate('/admindashboard');
          } else {
            console.error("Unauthorized access attempt");
            showErrorToast("Unauthorized access to admin dashboard.");
            navigate('/login');
          }
        } else {
          console.error("No user data in API response");
          navigate('/login');
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        showErrorToast("Authentication failed. Please try again.");
        navigate('/login');
      });
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#24CFA6] mx-auto mb-4"></div>
        <p>Authenticating admin access...</p>
      </div>
    </div>
  );
};

export default AdminAuthSuccess;
