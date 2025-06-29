import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("Neurology");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await axios.get("http://localhost:5000/api/appointments/doctors");
      const filtered = data.filter(
        (doc) => doc.role === "doctor" && doc.department === selectedDepartment
      );
      setDoctors(filtered);
    };

    fetchDoctors();
  }, [selectedDepartment]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Available Doctors</h1>

      <div className="mb-6">
        <label className="text-sm mr-4">Filter by Department:</label>
        <select
          className="bg-gray-800 border border-cyan-500 text-white px-4 py-2 rounded"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="Neurology">Neurology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Pathology">Pathology</option>
          <option value="Radiology">Radiology</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc._id}
            className="bg-slate-800 p-4 rounded-lg border border-cyan-500 shadow-xl flex flex-col items-center"
          >
            <img
              src={doc.image}
              alt={doc.name}
              className="w-full h-52 object-cover rounded mb-4 border border-cyan-400"
            />
            <h2 className="text-xl font-bold text-center">{doc.name}</h2>
            <p className="text-sm text-cyan-300 text-center">{doc.department}</p>

            <button
              className="mt-4 bg-cyan-600 hover:bg-cyan-700 w-full py-2 rounded text-white font-semibold"
              onClick={() =>
                navigate("/dashboard/book-doctor", {
                  state: { doctorId: doc._id, doctorName: doc.name },
                })
              }
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorDirectory;
