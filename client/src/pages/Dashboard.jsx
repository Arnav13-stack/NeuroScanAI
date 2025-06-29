import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState("Neurology");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const departmentRef = useRef(null);
  const [pendingAppointments, setPendingAppointments] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }
      
      setUser(payload);
    } catch (e) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (user.role === "patient") {
          const { data } = await axios.get("http://localhost:5000/api/appointments/doctors", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          const filtered = data.filter((doc) => doc.department === department);
          setDoctors(filtered);
        }

        if (user.role === "doctor") {
          const { data } = await axios.get(
            `http://localhost:5000/api/appointments/doctor/${user.id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          const acceptedPatients = data.filter((appt) => appt.status === "accepted");
          setPatients(acceptedPatients);
          const pending = data.filter((appt) => appt.status === "pending");
          setPendingAppointments(pending.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, department]);

  useEffect(() => {
    if (departmentRef.current) {
      departmentRef.current.classList.add("animate-pulse");
      const timer = setTimeout(() => {
        departmentRef.current.classList.remove("animate-pulse");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [department]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleDepartmentChange = (dept) => {
    setDepartment(dept);
  };

  if (!user) {
    return <div></div>;
  }

  const isFullScreenPage = location.pathname.includes('/dashboard/book-doctor') || 
                         location.pathname.includes('/dashboard/chat') ||
                         location.pathname.includes('/dashboard/appointments') ||
                         location.pathname.includes('/dashboard/ai-chat') ||
                         location.pathname.includes('/dashboard/voice-test');

  return (
    <div className="flex min-h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Ultra Attractive Animated Background */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Floating gradient bubbles */}
        <div className="absolute top-10 left-10 w-60 h-60 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full filter blur-[100px] opacity-10 animate-bubble1"></div>
        <div className="absolute top-1/4 right-20 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full filter blur-[120px] opacity-10 animate-bubble2"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full filter blur-[110px] opacity-10 animate-bubble3"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-green-400 to-teal-500 rounded-full filter blur-[90px] opacity-10 animate-bubble4"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[length:50px_50px] bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] animate-grid-pulse"></div>
        </div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white opacity-[0.03]"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float-particle ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        
        {/* Subtle pulse effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/5 to-blue-900/10 animate-pulse-slow"></div>
      </div>

      {/* Sidebar - Hidden on full screen pages */}
      {!isFullScreenPage && (
        <div className="w-64 bg-gray-800/80 backdrop-blur-lg border-r border-gray-700/50 p-4 flex flex-col z-10">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-cyan-400">NeuroScanAI</h1>
            <p className="text-sm text-gray-400">
              {user ? `Welcome, ${user.role.toUpperCase()}` : "Loading..."}
            </p>
          </div>

          <nav className="flex-1">
            <div className="mb-6">
              <h3 className="text-xs uppercase text-gray-500 mb-2">Dashboard</h3>
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => navigate("/dashboard")}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700/50 transition flex items-center hover:translate-x-1"
                  >
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Home
                  </button>
                </li>
                {user.role === "doctor" && (
                  <li>
                    <button 
                      onClick={() => navigate("/dashboard/appointments")}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-700/50 transition flex items-center relative hover:translate-x-1"
                    >
                      <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Appointments
                      {pendingAppointments > 0 && (
                        <span className="absolute right-3 top-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-ping-once">
                          {pendingAppointments}
                        </span>
                      )}
                    </button>
                  </li>
                )}
                <li>
                  <button 
                    onClick={() => navigate("/dashboard/chat")}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700/50 transition flex items-center hover:translate-x-1"
                  >
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    {user.role === "doctor" ? "Chat with Patients" : "Chat with Doctor"}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/dashboard/ai-chat")}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700/50 transition flex items-center hover:translate-x-1"
                  >
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    Chat with AI
                  </button>
                </li>
                {user.role === "patient" && (
                  <li>
                    <button 
                      onClick={() => navigate("/dashboard/voice-test")}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-700/50 transition flex items-center hover:translate-x-1"
                    >
                      <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                      </svg>
                      Voice Assessment
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {user.role === "patient" && (
              <div className="mb-6">
                <h3 className="text-xs uppercase text-gray-500 mb-2">Departments</h3>
                <ul className="space-y-1">
                  {["Neurology", "Dermatology", "Pathology", "Radiology"].map((dept) => (
                    <li key={dept}>
                      <button 
                        onClick={() => handleDepartmentChange(dept)}
                        className={`w-full text-left px-3 py-2 rounded transition flex items-center ${
                          department === dept 
                            ? "bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400" 
                            : "hover:bg-gray-700/50 hover:border-l-4 hover:border-gray-600"
                        }`}
                      >
                        {dept}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          <div className="mt-auto">
            <button 
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded hover:bg-gray-700/50 transition flex items-center text-red-400 hover:translate-x-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`${isFullScreenPage ? "flex-1" : "flex-1 p-4 md:p-8"} relative z-10`}>
        <Outlet />
        {!isFullScreenPage && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-1">
                Welcome, <span className="capitalize">{user.name}</span>
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-3 animate-width-grow"></div>
              
              {user.role === "patient" && (
                <p className="text-gray-300 text-sm md:text-base">
                  Viewing <span ref={departmentRef} className="font-bold text-cyan-400 transition-all duration-300">
                    {department}
                  </span> department
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : user.role === "patient" ? (
              <>
                {doctors.length === 0 ? (
                  <div className="bg-slate-800/70 border border-cyan-500/20 rounded-lg p-6 text-center backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
                    <p className="text-gray-300">No doctors found in {department} department</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {doctors.map((doc, index) => (
                      <div
                        key={doc._id}
                        className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                          opacity: 0,
                        }}
                      >
                        <div className="relative group mb-3 overflow-hidden rounded-md">
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent z-10"></div>
                          <img
                            src={doc.image || "/doctor-placeholder.png"}
                            alt={doc.name}
                            className="w-full h-32 object-cover rounded-md border border-cyan-400/30 group-hover:scale-105 transition-all duration-500"
                            onError={(e) => {
                              e.target.src = "/doctor-placeholder.png";
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-white mb-1">{doc.name}</h3>
                          <p className="text-cyan-300 text-sm mb-2">{doc.department}</p>
                          <button
                            onClick={() => navigate("/dashboard/book-doctor", { 
                              state: { 
                                doctorId: doc._id,
                                doctorName: doc.name,
                                department: doc.department 
                              } 
                            })}
                            className="px-3 py-1.5 text-sm bg-gradient-to-r from-cyan-600 to-blue-600 rounded-md font-medium hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/30"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Your Patients</h2>
                {patients.length === 0 ? (
                  <div className="bg-slate-800/70 border border-cyan-500/20 rounded-lg p-6 text-center backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
                    <p className="text-gray-300">No accepted appointments yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {patients.map((appt, index) => {
                      const patId =
                        typeof appt.patientId === "object" ? appt.patientId._id : appt.patientId;
                      const patName =
                        typeof appt.patientId === "object" ? appt.patientId.name : appt.patientName;

                      return (
                        <div
                          key={appt._id}
                          className="bg-slate-800/70 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 cursor-pointer hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1"
                          style={{
                            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                            opacity: 0,
                          }}
                          onClick={() =>
                            navigate("/dashboard/chat", {
                              state: {
                                doctorId: user.id,
                                patientId: patId,
                                patientName: patName,
                              },
                            })
                          }
                        >
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3 ring-2 ring-cyan-500/30 hover:ring-cyan-400/50 transition-all">
                              <span className="text-lg text-cyan-400">
                                {patName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{patName}</h3>
                              <p className="text-xs text-cyan-300">{appt.date}</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="bg-gray-700/50 px-2 py-0.5 rounded-full">
                              {appt.department}
                            </span>
                            <span className="bg-cyan-600/20 text-cyan-400 px-2 py-0.5 rounded-full">
                              {appt.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bubble1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 30px) scale(1.1); }
        }
        @keyframes bubble2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.15); }
        }
        @keyframes bubble3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }
        @keyframes bubble4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -20px) scale(1.1); }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-100px) translateX(20px); }
          100% { transform: translateY(-200px) translateX(0); }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }
        @keyframes width-grow {
          0% { width: 0; }
          100% { width: 4rem; }
        }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bubble1 { animation: bubble1 25s ease-in-out infinite; }
        .animate-bubble2 { animation: bubble2 30s ease-in-out infinite; }
        .animate-bubble3 { animation: bubble3 20s ease-in-out infinite; }
        .animate-bubble4 { animation: bubble4 35s ease-in-out infinite; }
        .animate-grid-pulse { animation: grid-pulse 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }
        .animate-width-grow { animation: width-grow 0.5s ease-out forwards; }
        .animate-ping-once { animation: ping-once 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default Dashboard;