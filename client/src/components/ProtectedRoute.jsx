import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:5000/api/auth/check", { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated === null) return null; // Show nothing while loading
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
