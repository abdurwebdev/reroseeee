// src/components/RequestCallback.js
import React, { useState } from "react";
import axios from "axios";

const RequestCallback = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateTime: "",
    enquiryType: "Online Courses (Website)",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/request-callback", formData);
      setMessage("Your request has been submitted successfully!");
    } catch (error) {
      setMessage("Failed to send request. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg w-96 text-black">
        <button className="absolute top-2 right-2 text-white" onClick={onClose}>✖</button>
        <h2 className="text-lg font-bold">Request a Callback</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="text" name="name" placeholder="Name" className="w-full p-2 mb-3" onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone" className="w-full p-2 mb-3" onChange={handleChange} required />
          <input type="datetime-local" name="dateTime" className="w-full p-2 mb-3" onChange={handleChange} required />
          <select name="enquiryType" className="w-full p-2 mb-3" onChange={handleChange}>
            <option>Online Courses (Website)</option>
            <option>Offline Classes</option>
          </select>
          <button type="submit" className="w-full bg-green-500 p-2" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
        </form>
        {message && <p className="mt-2 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default RequestCallback;