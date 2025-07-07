// src/pages/Login.jsx
import { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home"); // Redirect to home or dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Google login successful!");
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Left image section - hidden on small screens */}
      <div className="hidden md:block md:w-1/2 h-full">
        <img
          src="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Signin Visual"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right side: Title + login form */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-full bg-gray-100 px-4 py-6">
        {/* Brand Title */}
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-6 tracking-tight">
          Wealth Home
        </h1>

        {/* Login card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide">
            Log in to unlock your next investment!!
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer select-none text-base"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-500" />
                Remember me
              </label>
              <a href="/signup" className="text-gray-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login
            </button>
          </form>

          <div className="my-6 border-t border-gray-300"></div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 py-2 rounded-md text-sm font-medium transition duration-300"
          >
            <img
              src="https://img.icons8.com/color/512/google-logo.png"
              alt="Google logo"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Register
            </button>
          </p>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">
              Invalid email or password. Please try again.
            </p>
          )}

        </div>
      </div>
    </div>
  );
};


export default Login;
