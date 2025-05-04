// App.js
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketContext';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Landing from "./pages/Landing"; // Import the Landing page
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
import History from "./pages/History"; // Watch history page
import WatchLater from "./pages/WatchLater"; // Watch later page
import LikedVideos from "./pages/LikedVideos"; // Liked videos page
import Trending from "./pages/Trending"; // Trending videos page
import Shorts from "./pages/Shorts"; // Shorts page
import Subscriptions from "./pages/Subscriptions"; // Subscriptions page
import YourVideos from "./pages/YourVideos"; // Your videos page
import ProfileSetup from "./pages/ProfileSetup";
import AdminUserDashboard from "./pages/AdminUserDashboard";
import AdminVideoDashboard from "./pages/AdminVideoDashboard";
import AdminCourseDashboard from "./pages/AdminCourseDashboard"; // Admin course dashboard
import CourseVideos from "./pages/CourseVideos"; // Course videos page
import AdminEarningsDashboard from "./pages/AdminEarningsDashboard"; // Admin earnings dashboard
import AdminWithdrawalsDashboard from "./pages/AdminWithdrawalsDashboard"; // Admin withdrawals dashboard
import Playlists from "./pages/Playlists"; // User playlists page
import Downloads from "./pages/Downloads"; // User downloads page
import YourClips from "./pages/YourClips"; // User clips page
import Settings from "./pages/Settings"; // User settings page
import ReportHistory from "./pages/ReportHistory"; // User report history page
import Help from "./pages/Help"; // Help center page
import Feedback from "./pages/Feedback"; // Feedback page
import PaymentError from "./pages/PaymentError"; // Payment error page
import PaymentHistory from "./pages/PaymentHistory"; // Payment history page
import PageTester from "./pages/PageTester"; // Page tester utility
import GoLive from "./pages/GoLive";
import WatchLivestream from "./pages/WatchLivestream";
import ChannelPage from "./pages/ChannelPage"; // Channel page
import CreatorStudio from "./pages/CreatorStudio"; // Creator Studio
import StudioDashboard from "./components/studio/StudioDashboard";
import StudioContent from "./components/studio/StudioContent";
import StudioAnalytics from "./components/studio/StudioAnalytics";
import StudioMonetization from "./components/studio/StudioMonetization";
import StudioVerification from "./components/studio/StudioVerification";
import StudioSettings from "./components/studio/StudioSettings";
import CreatorCourseDashboard from "./components/studio/CreatorCourseDashboard";
import AdminCourseReviewDashboard from "./components/admin/AdminCourseReviewDashboard";
import Messaging from "./pages/Messaging";
import AuthSuccess from "./pages/AuthSuccess";
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

      <SocketProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studentdashboard" element={<Studentdashboard />} />
          <Route path="/admindashboard" element={<Admindashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/course-videos/:courseId" element={<CourseVideos />} />
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
          <Route path="/admindashboard/course-dashboard" element={<AdminCourseDashboard />} />
          <Route path="/admindashboard/earnings-dashboard" element={<AdminEarningsDashboard />} />
          <Route path="/admindashboard/withdrawals-dashboard" element={<AdminWithdrawalsDashboard />} />
          <Route path="/live-course" element={<GoLive />} />
          <Route path="/watch-livestream/:id" element={<WatchLivestream />} />
          <Route path="/channel/:channelId" element={<ChannelPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/watch-later" element={<WatchLater />} />
          <Route path="/liked-videos" element={<LikedVideos />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/your-videos" element={<YourVideos />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/your-clips" element={<YourClips />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/report-history" element={<ReportHistory />} />
          <Route path="/help" element={<Help />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/error" element={<PaymentError />} />
          <Route path="/payment/history" element={<PaymentHistory />} />
          <Route path="/page-tester" element={<PageTester />} />

          {/* Creator Studio Routes */}
          <Route path="/studio" element={<CreatorStudio />}>
            <Route index element={<StudioDashboard />} />
            <Route path="content" element={<StudioContent />} />
            <Route path="courses" element={<CreatorCourseDashboard />} />
            <Route path="analytics" element={<StudioAnalytics />} />
            <Route path="monetization" element={<StudioMonetization />} />
            <Route path="verification" element={<StudioVerification />} />
            <Route path="settings" element={<StudioSettings />} />
          </Route>

          {/* Admin Course Review Route */}
          <Route path="/admindashboard/course-review" element={<AdminCourseReviewDashboard />} />
          <Route path="/messages" element={<Messaging />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;