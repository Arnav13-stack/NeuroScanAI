// src/pages/ChatRoom.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const chatRef = useRef();

  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;
  const role = payload.role;

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (role === "patient") {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/appointments/by-patient/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const acceptedAppointments = res.data.filter(a => a.status === "accepted");
          setAppointments(acceptedAppointments);
          
          if (acceptedAppointments.length > 0 && !selectedChat) {
            const firstAppt = acceptedAppointments[0];
            setSelectedChat({
              doctorId: firstAppt.doctorId._id || firstAppt.doctorId,
              patientId: userId,
              doctorName: firstAppt.doctorId.name || "Doctor",
            });
          }
        } catch (err) {
          console.error("Error fetching appointments:", err);
        }
      } else if (role === "doctor") {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/appointments/doctor/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const acceptedAppointments = res.data.filter(a => a.status === "accepted");
          setAppointments(acceptedAppointments);
        } catch (err) {
          console.error("Error fetching appointments:", err);
        }
      }
    };

    fetchAppointments();
  }, [role, userId, token]); // Removed selectedChat from dependencies

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        const { doctorId, patientId } = selectedChat;
        try {
          const { data } = await axios.get(
            `http://localhost:5000/api/chat/${doctorId}/${patientId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessages(data.data);
          scrollToBottom();
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      }
    };

    fetchMessages();
  }, [selectedChat, token]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedChat || isSending) return;

    setIsSending(true);
    const { doctorId, patientId } = selectedChat;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat/send",
        { message: text.trim(), doctorId, patientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [
        ...prev,
        { ...response.data.data, sender: { _id: userId, name: payload.name, role } },
      ]);
      setText("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (role === "patient" && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl border border-cyan-400/30">
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">No Appointments Found</h2>
          <p className="text-gray-300">You don't have any accepted appointments yet.</p>
        </div>
      </div>
    );
  }

  if (role === "doctor" && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl border border-cyan-400/30">
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">No Appointments Found</h2>
          <p className="text-gray-300">You don't have any accepted appointments yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800/80 rounded-xl shadow-xl border border-gray-700/50 mr-4 flex flex-col">
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-cyan-400 text-center">
            {role === "patient" ? "Your Doctors" : "Your Patients"}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {appointments.map((appt, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedChat({
                doctorId: appt.doctorId._id || appt.doctorId,
                patientId: appt.patientId._id || appt.patientId,
                doctorName: role === "patient" ? 
                  (appt.doctorId?.name || "Doctor") : 
                  (appt.patientId?.name || "Patient"),
              })}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedChat?.doctorId === (appt.doctorId._id || appt.doctorId) &&
                selectedChat?.patientId === (appt.patientId._id || appt.patientId)
                  ? "bg-cyan-600/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/10"
                  : "bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/30"
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3">
                  <span className="text-cyan-400 text-lg">
                    {(role === "patient" ? appt.doctorId?.name?.[0] : appt.patientId?.name?.[0]) || "?"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {role === "patient" ? appt.doctorId?.name || "Doctor" : appt.patientId?.name || "Patient"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {appt.date} at {appt.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-800/80 rounded-xl shadow-xl border border-gray-700/50 overflow-hidden">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-cyan-400">
                Chat with <span className="text-white">{selectedChat.doctorName}</span>
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900/30">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mb-3 ${
                    msg.sender._id === userId || msg.sender === userId 
                      ? "justify-end" 
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-2xl p-3 relative ${
                      msg.sender._id === userId || msg.sender === userId
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-gray-700 text-white rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <div className={`absolute -bottom-3 ${
                      msg.sender._id === userId || msg.sender === userId
                        ? "-right-1"
                        : "-left-1"
                    }`}>
                      <div className={`w-4 h-4 ${
                        msg.sender._id === userId || msg.sender === userId
                          ? "bg-cyan-600"
                          : "bg-gray-700"
                      }`} style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}></div>
                    </div>
                    <div className="text-xs text-gray-300 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatRef} />
            </div>

            <div className="p-4 border-t border-gray-700/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-400"
                  placeholder="Type your message..."
                  disabled={isSending}
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !text.trim()}
                  className={`px-5 py-3 rounded-lg font-semibold transition-all ${
                    isSending || !text.trim()
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20"
                  }`}
                >
                  {isSending ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700/50 border border-gray-600/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a chat</h3>
              <p className="text-gray-400">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatRoom;