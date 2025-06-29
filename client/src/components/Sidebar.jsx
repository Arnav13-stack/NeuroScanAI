import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Sidebar({ role, onDepartmentChange }) {
  const [showChatLink, setShowChatLink] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const departments = ["Neurology", "Dermatology", "Pathology", "Radiology"];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const userId = JSON.parse(atob(token.split(".")[1])).id;

      try {
        if (role === "patient") {
          const { data } = await axios.get(
            `http://localhost:5000/api/appointments/by-patient/${userId}`
          );
          const accepted = data.find((appt) => appt.status === "accepted");
          if (accepted) setShowChatLink(true);
        } else if (role === "doctor") {
          const pendingRes = await axios.get(
            `http://localhost:5000/api/appointments/doctor/${userId}?status=pending`
          );
          setAppointmentCount(pendingRes.data.length);
          
          const acceptedRes = await axios.get(
            `http://localhost:5000/api/appointments/doctor/${userId}?status=accepted`
          );
          setShowChatLink(acceptedRes.data.length > 0);
        }
      } catch (err) {
        console.error("Sidebar data fetch failed:", err);
      }
    };

    fetchData();
  }, [role]);

  return (
    <div className="w-60 bg-[#0e1a2b] h-screen p-6 text-white shadow-lg">
      <h2 className="text-cyan-400 text-xl font-bold mb-8">NeuroScanAI</h2>
      <ul className="space-y-4 text-sm">
        <li>
          <Link to="/dashboard" className="hover:text-cyan-300">
            Dashboard Home
          </Link>
        </li>

        {role === "patient" && (
          <>
            <li>
              <Link to="/dashboard/doctors" className="hover:text-cyan-300">
                Find Doctors
              </Link>
            </li>
            <li className="text-gray-400 uppercase text-xs mt-4">Departments</li>
            {departments.map((dep) => (
              <li key={dep}>
                <button
                  className="hover:text-cyan-300"
                  onClick={() => onDepartmentChange(dep)}
                >
                  {dep}
                </button>
              </li>
            ))}
            <li>
              <Link to="/dashboard/ai-chat" className="hover:text-cyan-300">
                Chat with AI
              </Link>
            </li>
            <li>
              <Link to="/dashboard/voice-test" className="hover:text-cyan-300">
                Voice Assessment
              </Link>
            </li>
            {showChatLink && (
              <li>
                <Link to="/dashboard/chat" className="hover:text-cyan-300">
                  Chat with Doctor
                </Link>
              </li>
            )}
          </>
        )}

        {role === "doctor" && (
          <>
            <li className="relative">
              <Link to="/dashboard/appointments" className="hover:text-cyan-300 flex items-center">
                Appointment Requests
                {appointmentCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {appointmentCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/dashboard/patients" className="hover:text-cyan-300">
                Patient Records
              </Link>
            </li>
            {showChatLink && (
              <li>
                <Link to="/dashboard/chat" className="hover:text-cyan-300">
                  Chat with Patient
                </Link>
              </li>
            )}
            <li>
              <Link to="/dashboard/ai-chat" className="hover:text-cyan-300">
                Chat with AI
              </Link>
            </li>
            <li>
              <Link to="/dashboard/voice-test" className="hover:text-cyan-300">
                Voice Assessment
              </Link>
            </li>
          </>
        )}

        <li>
          <button
            className="mt-4 text-red-400 hover:text-red-500"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;