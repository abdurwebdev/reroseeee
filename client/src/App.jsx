// App.js
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
function App() {
  return (
    <BrowserRouter>
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
        <Route path="/admindashboard/user-admin-dashboard" element={<AdminUserDashboard/>}/>
        <Route path="/admindashboard/video-admin-dashboard" element={<AdminVideoDashboard/>}/>
        <Route path="/live-course" element={<GoLive/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;