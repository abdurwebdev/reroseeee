import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import { FaBars, FaUser, FaEnvelope } from "react-icons/fa";
import { showSuccessToast, showErrorToast, showInfoToast } from "../utils/toast";
import NotificationButton from "./NotificationButton";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Profile menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // First check localStorage for faster initial load
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedUser && storedUser.profileImageUrl) {
          // If we have a stored user with profile image, use it immediately
          if (isMounted) setUser(storedUser);
          setLoading(false);
        }

        // Then verify with server and update if needed
        const response = await axiosInstance.get('/api/auth/check');

        if (isMounted && response.data.user) {
          setUser(response.data.user);

          // Update localStorage if needed
          if (JSON.stringify(response.data.user) !== JSON.stringify(storedUser)) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        }
      } catch (error) {
        // If server check fails but we have localStorage user, keep using that
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser && isMounted) setUser(null);

        console.error("Auth check error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  // We're now using the NotificationButton component for notifications

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
      // Clear user data from localStorage
      localStorage.removeItem("user");
      // Clear token
      localStorage.removeItem("token");
      // Reset notification initialization state
      localStorage.removeItem("notificationsInitialized");
      setUser(null);

      // Show success toast
      showSuccessToast("You have been successfully logged out");

      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Still clear localStorage even if server request fails
      localStorage.removeItem("user");
      // Clear token
      localStorage.removeItem("token");
      // Reset notification initialization state
      localStorage.removeItem("notificationsInitialized");
      setUser(null);

      // Show info toast
      showInfoToast("You have been logged out");

      navigate("/login");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/api/student/request-callback', formData);

      // Show success toast
      showSuccessToast("Your callback request has been submitted successfully!");

      setShowPopup(false);
      setFormData({ name: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error submitting callback request:", error);

      // Show error toast
      showErrorToast("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // We're now using the NotificationButton component for notifications

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const showMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  // We're now using date-fns in the NotificationItem component

  // Replace all instances of user.profileImageUrl usage with a helper function for consistency
  const getProfileImage = (profileImageUrl, name) => {
    if (profileImageUrl) {
      return `${API_URL}${profileImageUrl}`;
    }
    // fallback to default avatar image or initial
    return null;
  };

  return (
    <>
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-black text-white px-3 py-3 shadow-md">
        {/* Mobile Menu */}
        <div
          className={`w-full h-screen bg-black fixed top-0 left-0 z-40 transition-transform duration-500 ${menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-white text-xl relative">
            <button onClick={closeMenu} className="absolute top-5 right-5 text-3xl">✕</button>
            <Link to="/" onClick={closeMenu} className="hover:text-gray-400">Home</Link>
            <Link to="/courses" onClick={closeMenu} className="hover:text-gray-400">Courses</Link>
            <Link to="/lms" onClick={closeMenu} className="hover:text-gray-400">LMS</Link>
            <Link to="/live-course" onClick={closeMenu} className="hover:text-gray-400">Live Course</Link>
            <Link to="/feed" onClick={closeMenu} className="hover:text-gray-400">Feed</Link>
            <Link to="/messages" onClick={closeMenu} className="hover:text-gray-400 flex items-center">
              <FaEnvelope className="mr-2" /> Messages
            </Link>
            <Link to="/downloads" onClick={closeMenu} className="hover:text-gray-400">Downloads</Link>
            <button onClick={() => { setShowPopup(true); closeMenu(); }} className="hover:text-gray-400">
              Request Callback
            </button>

            {loading ? (
              <span className="text-gray-400">Checking...</span>
            ) : user ? (
              <div className="flex flex-col items-center">
                {getProfileImage(user.profileImageUrl, user.name) ? (
                  <img
                    src={getProfileImage(user.profileImageUrl, user.name)}
                    alt={user.name}
                    className="w-12 h-12 rounded-full mb-2 object-cover"
                    onError={(e) => e.target.src = "/default-avatar.png"}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                    <FaUser className="text-2xl text-gray-300" />
                  </div>
                )}
                <p className="text-center mb-2">{user.name}</p>
                <Link
                  to={`/channel/${user._id}`}
                  onClick={closeMenu}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition mb-2"
                >
                  Your Channel
                </Link>
                {user.role === 'creator' && (
                  <Link
                    to="/studio"
                    onClick={closeMenu}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white transition mb-2"
                  >
                    Creator Studio
                  </Link>
                )}
                {user.role === 'professional_coder' ? (
                  <>
                    <Link
                      to="/coding-videos"
                      onClick={closeMenu}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition mb-2"
                    >
                      Coding Videos
                    </Link>
                    <Link
                      to="/upload-coding-video"
                      onClick={closeMenu}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition mb-2"
                    >
                      Upload Coding Video
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/coder-verification"
                    onClick={closeMenu}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition mb-2"
                  >
                    Become a Professional Coder
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="bg-[#24CFA6] px-4 py-2 rounded text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="bg-[#24CFA6] px-4 py-2 rounded text-white transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl">⚔️</h1>
          <Link to="/" className="text-lg font-semibold flex items-center">
            <span className="hidden sm:inline">Rerose</span> Academy
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-6">
          <Link to="/" className="hover:text-gray-400">Home</Link>
          <Link to="/courses" className="hover:text-gray-400">Courses</Link>
          <Link to="/lms" className="hover:text-gray-400 font-bold">LMS</Link>
          <Link to="/live-course" className="font-bold hover:text-gray-400">Live Course</Link>
          <Link to="/feed" className="hover:text-gray-400">Feed</Link>
          <Link to="/messages" className="hover:text-gray-400 flex items-center">
            <FaEnvelope className="mr-2" /> Messages
          </Link>
          <Link to="/downloads" className="hover:text-gray-400">Downloads</Link>
          <button onClick={() => setShowPopup(true)} className="hover:text-gray-400">Request Callback</button>
        </div>

        {/* Auth Buttons or Profile Image */}
        <div className="hidden lg:flex items-center space-x-4">
          {loading ? (
            <span className="text-gray-400">Checking...</span>
          ) : user ? (
            <>
              {/* Notifications */}
              <NotificationButton user={user} API_URL={API_URL} />

              {/* User Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center"
                  aria-label="User profile"
                >
                  {getProfileImage(user.profileImageUrl, user.name) ? (
                    <img
                      src={getProfileImage(user.profileImageUrl, user.name)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                      onError={(e) => e.target.src = "/default-avatar.png"}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <FaUser className="text-xl text-gray-300" />
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#212121] rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center">
                        {getProfileImage(user.profileImageUrl, user.name) ? (
                          <img
                            src={getProfileImage(user.profileImageUrl, user.name)}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover mr-3"
                            onError={(e) => e.target.src = "/default-avatar.png"}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            <FaUser className="text-2xl text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-400 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Role: {user.role || 'Student'}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile-setup"
                      className="block p-3 hover:bg-gray-800"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Edit profile
                    </Link>
                    <Link
                      to={`/channel/${user._id}`}
                      className="block p-3 hover:bg-gray-800"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Your channel
                    </Link>
                    {user.role === 'creator' && (
                      <Link
                        to="/studio"
                        className="block p-3 hover:bg-gray-800"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Creator Studio
                      </Link>
                    )}
                    {user.role === 'professional_coder' ? (
                      <>
                        <Link
                          to="/coding-videos"
                          className="block p-3 hover:bg-gray-800"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Coding Videos
                        </Link>
                        <Link
                          to="/upload-coding-video"
                          className="block p-3 hover:bg-gray-800"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Upload Coding Video
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/coder-verification"
                        className="block p-3 hover:bg-gray-800"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Become a Professional Coder
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-3 hover:bg-gray-800 text-red-500"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-[#24CFA6] px-4 py-2 rounded text-white transition">Login</Link>
              <Link to="/register" className="bg-[#24CFA6] px-4 py-2 rounded text-white transition">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Right Section */}
        <div className="flex items-center space-x-4 lg:hidden">
          {!loading && user && (
            <>
              {/* Mobile Notifications */}
              <NotificationButton user={user} API_URL={API_URL} />
            </>
          )}

          {/* Hamburger */}
          <button onClick={showMenu} className="text-white text-2xl">
            <FaBars />
          </button>
        </div>
      </nav >

      {/* Callback Popup */}
      {
        showPopup && (
          <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white text-black p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Request a Callback</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </>
  );
}