import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const doctorId = payload ? payload.id : null;

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/appointments/doctor/${doctorId}?status=pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(data);
    } catch (err) {
      console.error("❌ Failed to load appointments", err);
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [doctorId, token]);

  useEffect(() => {
    if (doctorId) {
      fetchAppointments();
    } else {
      navigate("/login");
    }
  }, [doctorId, navigate, fetchAppointments]);

  const handleAction = async (id, type) => {
    try {
      const endpoint =
        type === "accept"
          ? `http://localhost:5000/api/appointments/accept/${id}`
          : `http://localhost:5000/api/appointments/reject/${id}`;

      // Optimistic UI update - remove immediately
      setAppointments(prev => prev.filter(appt => appt._id !== id));

      // Make the API call
      await axios.put(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh the list to ensure consistency
      await fetchAppointments();
      
    } catch (err) {
      console.error(`❌ Failed to ${type} appointment`, err);
      alert(`Failed to ${type} appointment`);
      // If error occurs, restore the appointment
      fetchAppointments();
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Appointment Requests
          </h1>
          <p className="text-gray-400 mt-1">Review and manage patient appointments</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/70 p-12 rounded-xl border border-gray-700 text-center shadow-lg">
          <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-medium text-gray-300 mb-2">No pending requests</h3>
          <p className="text-gray-500 max-w-md mx-auto">You're all caught up! There are no pending appointment requests at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-cyan-400/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{appt.patientName}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-900/50 text-cyan-400">
                      {appt.department}
                    </span>
                  </div>
                  <div className="text-xs px-2 py-1 bg-gray-700 rounded-md text-gray-300">
                    ID: {appt._id.slice(-6)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-400 mb-1">Age</p>
                    <p className="font-medium">{appt.patientAge || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-400 mb-1">Date</p>
                    <p className="font-medium">{appt.date ? formatDate(appt.date) : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-400 mb-1">Time</p>
                    <p className="font-medium">{formatTime(appt.time)}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-400 mb-1">Status</p>
                    <p className="font-medium text-amber-400 capitalize">{appt.status || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAction(appt._id, "accept")}
                    className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(appt._id, "reject")}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;