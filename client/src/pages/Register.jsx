import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const Register = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const { name, email, password, role } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);

      // Show success toast
      showSuccessToast("Registration successful! You can now log in.");

      // Redirect to login page for all roles
      navigate("/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      showErrorToast(errorMessage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex pt-20  items-center justify-center min-h-screen bg-black flex-col">
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-lg  shadow-lg w-96 text-white border border-gray-700"
        >
          <h2 className="text-3xl font-bold mb-4 text-center">Register</h2>
          <p className="text-gray-400 text-sm mb-6 text-center">Create an account to access all features</p>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full mb-4 p-3 border border-gray-600 bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full mb-4 p-3 border border-gray-600 bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full mb-4 p-3 border border-gray-600 bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex flex-col items-center bg-gray-800 p-3 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`w-5 h-5 rounded-full border ${role === "student" ? "bg-blue-500 border-blue-500" : "bg-gray-700 border-gray-600"} mb-2`}></span>
                <span className="text-center">Student</span>
                <span className="text-xs text-gray-400 text-center mt-1">Learn & watch</span>
              </label>

              <label className="flex flex-col items-center bg-gray-800 p-3 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={role === "creator"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`w-5 h-5 rounded-full border ${role === "creator" ? "bg-blue-500 border-blue-500" : "bg-gray-700 border-gray-600"} mb-2`}></span>
                <span className="text-center">Creator</span>
                <span className="text-xs text-gray-400 text-center mt-1">Upload & earn</span>
              </label>

              <label className="flex flex-col items-center bg-gray-800 p-3 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`w-5 h-5 rounded-full border ${role === "admin" ? "bg-blue-500 border-blue-500" : "bg-gray-700 border-gray-600"} mb-2`}></span>
                <span className="text-center">Admin</span>
                <span className="text-xs text-gray-400 text-center mt-1">Manage site</span>
              </label>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition-all duration-300">
            Register
          </button>

          {role === "creator" && (
            <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Creator Benefits:</h3>
              <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                <li>Upload videos and shorts</li>
                <li>Livestream to your audience</li>
                <li>Monetize content (1000+ subscribers)</li>
                <li>Access to Creator Studio</li>
              </ul>
            </div>
          )}
        </form>
        <Footer />
      </div>
    </>
  );
};

export default Register;