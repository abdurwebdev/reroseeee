import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminUserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          withCredentials: true,
        });
        setUsers(res.data); // Assuming backend sends list of users
      } catch (error) {
        alert("Failed to load users");
        console.error(error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        withCredentials: true,
      });
      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      alert("Failed to delete user");
      console.error(error);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/users/${userId}/promote`,
        {},
        { withCredentials: true }
      );
      setUsers(users.map((user) => (user._id === userId ? { ...user, role: "admin" } : user)));
      alert("User promoted to admin");
    } catch (error) {
      alert("Failed to promote user");
      console.error(error);
    }
  };

  const handleDemoteToStudent = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/users/${userId}/demote`,
        {},
        { withCredentials: true }
      );
      setUsers(users.map((user) => (user._id === userId ? { ...user, role: "student" } : user)));
      alert("User demoted to student");
    } catch (error) {
      alert("Failed to demote user");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center text-white mt-10">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard - Manage Users</h1>
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-gray-800 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handlePromoteToAdmin(user._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                      >
                        Promote to Admin
                      </button>
                    )}
                    {user.role !== "student" && (
                      <button
                        onClick={() => handleDemoteToStudent(user._id)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-2"
                      >
                        Demote to Student
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminUserDashboard;
