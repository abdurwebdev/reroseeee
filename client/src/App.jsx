// App.js
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Studentdashboard from "./pages/Studentdashboard";
import Admindashboard from "./pages/Admindashboard";
import Courses from "./courses/Courses";
import CourseDetails from "./pages/CourseDetails";
import RequestCallback from "./components/RequestCallback";
import PaymentSuccess from "./pages/PaymentSuccess";
import LMSPage from "./pages/LMSPage";
import Feed from "./pages/Feed";
import Watch from "./pages/Watch";
import UploadVideo from "./pages/UploadVideo"; // New page for video uploads
import UploadShort from "./pages/UploadShort"; // New page for short uploads
import ProfileSetup from "./pages/ProfileSetup";
import AdminUserDashboard from "./pages/AdminUserDashboard";
import AdminVideoDashboard from "./pages/AdminVideoDashboard";
import GoLive from "./pages/GoLive";
import WatchLivestream from "./pages/WatchLivestream";
function App() {
  return (
    <BrowserRouter>
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studentdashboard" element={<Studentdashboard />} />
        <Route path="/admindashboard" element={<Admindashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/requestcallback" element={<RequestCallback />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/lms" element={<LMSPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/upload-video" element={<UploadVideo />} />
        <Route path="/upload-short" element={<UploadShort />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/admindashboard/user-admin-dashboard" element={<AdminUserDashboard />} />
        <Route path="/admindashboard/video-admin-dashboard" element={<AdminVideoDashboard />} />
        <Route path="/live-course" element={<GoLive />} />
        <Route path="/watch-livestream/:id" element={<WatchLivestream />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;