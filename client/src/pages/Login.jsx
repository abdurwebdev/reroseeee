import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));

      // Show success toast
      showSuccessToast(`Welcome back, ${user.name}!`);

      // Check if profile image is missing, redirect to profile setup
      if (!user.profileImageUrl) {
        navigate("/profile-setup");
      } else if (user.role === "admin") {
        navigate("/admindashboard");
      } else if (user.role === "student" || user.role === "creator") {
        navigate("/feed");
      } else {
        setError("Unauthorized Role");
        showErrorToast("Unauthorized Role");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login Failed. Please check your credentials.";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-8">Sign In</h1>

        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-md mb-4 w-96 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded-lg shadow-lg w-96">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full mb-4 p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
            required
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full mb-4 p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:border-green-500"
            required
          />
          <button
            className={`w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-md font-semibold transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="flex flex-col items-center gap-4 mt-6">
          <a
            href="http://localhost:5000/api/auth/google"
            className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-md shadow-lg w-96 justify-center hover:bg-gray-800 transition-all"
          >
            <span className="text-xl">🔵</span> Continue with Google
          </a>
          <Link to="/register" className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-md shadow-lg w-96 justify-center hover:bg-gray-800 transition-all">
            <span className="text-xl">👤</span> Create a New Account
          </Link>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Login;