import { Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import Applications from "./pages/Applications.jsx";
import ATSChecker from "./pages/ATSChecker.jsx";
import Interview from "./pages/Interview.jsx";
import Career from "./pages/Career.jsx";
import Messages from "./pages/Messages.jsx";
import Pricing from "./pages/Pricing.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import EmployerJobs from "./pages/EmployerJobs.jsx";
import PostJob from "./pages/PostJob.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Routes>
        <Route path="/" element={<Landing />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/ats" element={<ProtectedRoute roles={["intern"]}><ATSChecker /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute roles={["intern"]}><Interview /></ProtectedRoute>} />
        <Route path="/career" element={<ProtectedRoute roles={["intern"]}><Career /></ProtectedRoute>} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/employer/jobs" element={<ProtectedRoute roles={["employer", "admin"]}><EmployerJobs /></ProtectedRoute>} />
        <Route path="/employer/post-job" element={<ProtectedRoute roles={["employer", "admin"]}><PostJob /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Admin section="overview" /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><Admin section="users" /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute roles={["admin"]}><Admin section="jobs" /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute roles={["admin"]}><Admin section="applications" /></ProtectedRoute>} />
        <Route path="/admin/interviews" element={<ProtectedRoute roles={["admin"]}><Admin section="interviews" /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={["admin"]}><Admin section="payments" /></ProtectedRoute>} />
        <Route path="/admin/post-job" element={<ProtectedRoute roles={["admin"]}><PostJob /></ProtectedRoute>} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </GoogleOAuthProvider>
  );
}
