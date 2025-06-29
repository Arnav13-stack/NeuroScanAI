import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import VoiceAssessment from "./pages/VoiceAssessment";
import DoctorList from "./pages/DoctorList";
import DoctorDirectory from "./pages/DoctorDirectory";
import DoctorAppointments from "./pages/DoctorAppointments";
import ChatRoom from "./pages/ChatRoom";
import AIChat from "./pages/AIChat";

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem("token");
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route 
          path="/" 
          element={
            localStorage.getItem("token") 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardContent />} />
            <Route path="voice-test" element={<VoiceAssessment />} />
            <Route path="book-doctor" element={<DoctorList />} />
            <Route path="doctors" element={<DoctorDirectory />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="chat" element={<ChatRoom />} />
            <Route path="ai-chat" element={<AIChat />} />
          </Route>
        </Route>

        <Route 
          path="*" 
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

function DashboardContent() {
  return null;
}

export default App;