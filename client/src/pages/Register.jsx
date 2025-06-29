import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    department: "",
    bio: "",
    image: "",
    age: "",
    experience: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid JPG or PNG image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      console.log("Sending registration data:", formData);
      const response = await axios.post(
        "http://localhost:5000/api/auth/register", 
        formData
      );
      
      console.log("Registration response:", response.data);
      
      if (formData.role === "doctor") {
        alert(
          `Doctor registered successfully!\n` +
          `Name: ${response.data.user.name}\n` +
          `Age: ${response.data.user.age || 'Not specified'}\n` +
          `Experience: ${response.data.user.experience || 'Not specified'}`
        );
      } else {
        alert("Registration successful!");
      }
      
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.details || 
                      err.message || 
                      "Registration failed. Please try again.";
      
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0a0f1e] to-[#0f172a]">
      <div className="w-full max-w-md p-8 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-400 shadow-[0_0_25px_#00e0ff] animate-fade-in-up text-white">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2 text-center font-mono">
          Create Account
        </h1>
        <p className="text-center text-gray-300 mb-6 text-sm">
          Join NeuroScanAI for smarter diagnostics
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              minLength="6"
              className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm text-cyan-300 mb-1">Account Type</label>
            <select
              name="role"
              className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {/* Doctor-Specific Fields */}
          {formData.role === "doctor" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Age</label>
                  <input
                    name="age"
                    type="number"
                    min="25"
                    max="80"
                    placeholder="35"
                    className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-cyan-300 mb-1">Experience</label>
                  <input
                    name="experience"
                    type="text"
                    placeholder="5 years"
                    className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-cyan-300 mb-1">Department</label>
                <select
                  name="department"
                  className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Radiology">Radiology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-cyan-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  placeholder="Tell us about your professional background..."
                  className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm text-cyan-300 mb-1">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                  onChange={handleImageUpload}
                  required
                />
                {formData.image && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-full border-2 border-cyan-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded font-semibold text-white transition duration-200 ${
              isSubmitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-300 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;