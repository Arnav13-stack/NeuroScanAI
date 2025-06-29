import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ setAuthStatus }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data } = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    
    // Add token validation before saving
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    if (!payload.id || !payload.exp) {
      throw new Error("Invalid token structure");
    }
    
    localStorage.setItem("token", data.token);
    navigate("/dashboard", { replace: true });
  } catch (err) {
    localStorage.removeItem("token"); // Ensure cleanup
    setError(err.response?.data?.error || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0a0f1e] to-[#0f172a]">
      <div className="w-full max-w-md p-8 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-400 shadow-[0_0_25px_#00e0ff] animate-fade-in-up text-white">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2 text-center font-mono">NeuroScanAI</h1>
        <p className="text-center text-gray-300 mb-6 text-sm">Secure neurological diagnostics login</p>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400 mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-cyan-300 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}