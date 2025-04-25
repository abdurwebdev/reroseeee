import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/check", { withCredentials: true });
        setUser(res.data.user);

        // Redirect based on role
        if (res.data.user.role === "admin") navigate("/admindashboard");
        else navigate("/studentdashboard");
      } catch (error) {
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="p-6">
      {user ? <h2>Welcome, {user.name}!</h2> : <p>You are not logged in.</p>}
    </div>
  );
};

export default Dashboard;
