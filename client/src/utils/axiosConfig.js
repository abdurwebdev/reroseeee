import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This enables sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token from localStorage if available
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
