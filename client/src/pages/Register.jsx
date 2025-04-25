import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

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
      alert("Registration successful");
      if (role === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="flex pt-20  items-center justify-center min-h-screen bg-black flex-col">
      <form 
        onSubmit={handleSubmit} 
        className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-lg  shadow-lg w-96 text-white border border-gray-700"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
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
        
        <select
          name="role"
          value={role}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-600 bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition-all duration-300">
          Register
        </button>
      </form>
      <Footer/>
    </div>
    </>
  );
};

export default Register;