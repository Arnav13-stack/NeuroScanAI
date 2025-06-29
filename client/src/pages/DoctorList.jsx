import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function DoctorList() {
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [appointmentType, setAppointmentType] = useState("online");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const tokenData = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
  const patientId = tokenData.id;
  const doctorId = location.state?.doctorId;


useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("http://localhost:5000/api/appointments/doctors");
        const found = data.find((doc) => doc._id === doctorId);
        if (!found) {
          navigate("/dashboard");
          return;
        }
        setDoctor(found);
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (err) {
        alert("Doctor not found");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (doctorId) fetchDoctor();
    else navigate("/dashboard");
  }, [doctorId, navigate]);

  const handleBook = async () => {
    if (!patientName || !patientAge) return alert("Please enter patient details");
    if (appointmentType === "offline" && (!date || !time)) {
      return alert("Please select date & time for offline appointment");
    }

    try {
      setIsBooking(true);
      await axios.post("http://localhost:5000/api/appointments/book", {
        patientId,
        doctorId,
        patientName,
        patientAge,
        department: doctor.department,
        doctorName: doctor.name,
        appointmentType,
        date: appointmentType === "offline" ? date : null,
        time: appointmentType === "offline" ? time : null,
      });

      document.querySelector('.success-confetti').classList.remove('hidden');
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate("/dashboard");
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      alert("Booking failed. Check console for details.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-pink-400 border-b-transparent animate-spin animation-delay-200"></div>
        </div>
        <p className="text-white text-lg font-medium">Loading Doctor Details...</p>
      </div>
    </div>
  );

  if (!doctor) return <div className="text-white p-10">Doctor not found</div>;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-10 overflow-hidden">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-pink-400/20"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.1
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Border */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 border-[16px] border-transparent animate-border-spin" style={{
          background: `linear-gradient(90deg, transparent, transparent), 
                      conic-gradient(from 0deg, #00FFFF, #FF00FF, #00FFFF)`,
          mask: 'linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)',
          maskComposite: 'exclude',
        }}></div>
      </div>

      {/* Success Confetti (hidden by default) */}
      <div className="success-confetti hidden absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `hsl(${Math.random() * 360}, 100%, 70%)`,
              top: '-10px',
              left: `${Math.random() * 100}%`,
              animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto z-10">
        {/* Doctor Profile Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12 transform transition-all duration-500 hover:scale-[1.01]">
          <div className="lg:w-1/3 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
            <img
              src={doctor.image || "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg"}
              alt={doctor.name}
              className="relative w-full h-80 lg:h-96 object-cover rounded-xl border-2 border-white/20 shadow-2xl transition-all duration-300 group-hover:shadow-cyan-500/30"
              onError={(e) => {
                e.target.src = "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg";
              }}
            />
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-full shadow-lg font-bold">
              {doctor.department}
            </div>
          </div>

          <div className="lg:w-2/3 bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Dr. {doctor.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-cyan-400/20 hover:border-cyan-400/50 transition-all">
                <p className="text-sm text-cyan-300 mb-1">Experience</p>
                <p className="text-xl font-semibold">{doctor.experience || "Not specified"}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-pink-400/20 hover:border-pink-400/50 transition-all">
                <p className="text-sm text-pink-300 mb-1">Age</p>
                <p className="text-xl font-semibold">{doctor.age || "Not specified"}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-400/20 hover:border-blue-400/50 transition-all">
                <p className="text-sm text-blue-300 mb-1">Specialization</p>
                <p className="text-xl font-semibold">{doctor.specialization || doctor.department}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-400/20 hover:border-purple-400/50 transition-all">
                <p className="text-sm text-purple-300 mb-1">Consultation Fee</p>
                <p className="text-xl font-semibold">${doctor.fee || "120"}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-cyan-300 mb-2">About Dr. {doctor.name.split(" ")[0]}</h3>
              <p className="text-gray-300 leading-relaxed">
                {doctor.bio || "Highly experienced professional with a passion for patient care. Committed to providing the highest quality medical services with a personalized approach to each case."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {["Cardiology", "General Practice", "Pediatrics", "Neurology"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-cyan-900/40 text-cyan-300 rounded-full text-sm border border-cyan-400/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Form Section */}
        <div className="max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Book Your Appointment
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Patient Name"
                  className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
                <span className="absolute left-4 -top-2 px-1 text-xs bg-gray-800 text-cyan-300">Full Name</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Patient Age"
                  className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white transition-all"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                />
                <span className="absolute left-4 -top-2 px-1 text-xs bg-gray-800 text-pink-300">Age</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={doctor.department}
                  className="w-full px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-300 cursor-not-allowed"
                />
                <span className="absolute left-4 -top-2 px-1 text-xs bg-gray-800 text-blue-300">Department</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={doctor.name}
                  className="w-full px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-300 cursor-not-allowed"
                />
                <span className="absolute left-4 -top-2 px-1 text-xs bg-gray-800 text-purple-300">Doctor</span>
              </div>
            </div>

            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white appearance-none transition-all"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                <option value="online">Online Consultation</option>
                <option value="offline">In-Person Visit</option>
              </select>
              <span className="absolute left-4 -top-2 px-1 text-xs bg-gray-800 text-cyan-300">Appointment Type</span>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {appointmentType === "offline" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white transition-all"
                  />
                  <span className="absolute left-4 -top-2 px-1 text-xs bg-gray-800 text-pink-300">Date</span>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white transition-all"
                  />
                  <span className="absolute left-4 -top-2 px-1 text-xs bg-gray-800 text-pink-300">Time</span>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={isBooking}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${
                isBooking 
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/40'
              }`}
            >
              {isBooking ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-100vh) rotate(360deg); }
        }
        @keyframes border-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-border-spin {
          animation: border-spin 8s linear infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}

export default DoctorList;