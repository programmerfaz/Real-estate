import { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import '../App.css';
import Login from "./login";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

 return (
  <div className="flex flex-col md:flex-row h-screen overflow-hidden">
    {/* Left image section - hidden on small screens */}
    <div className="hidden md:block md:w-1/2 h-full">
      <img
        src="../src/assets/sign-up-page.jpg"
        alt="Signup Visual"
        className="h-full w-full object-cover"
      />
    </div>

    {/* Right side: Title + signup form */}
    <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-full bg-gray-100 px-4 py-6">
      {/* Separate title above the card */}
      <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-6 tracking-tight">
        Wealth Home
      </h1>

      {/* Signup card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide">
          Find, Sell, or Invest — Start Here
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2.5 text-gray-500 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-2.5 text-gray-500 cursor-pointer"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Sign Up
          </button>
        </form>

        <div className="my-6 border-t border-gray-300"></div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 py-2 rounded-md text-sm font-medium transition duration-300"
        >
          <img
            src="../src/assets/google.png"
            alt="Google logo"
            className="w-5 h-5"
          />
          Sign Up with Google
        </button>

        <button
          onClick={goToLogin}
          className="w-full text-blue-600 hover:underline text-sm mt-2"
        >
          Already have an account? Login
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  </div>
);



};

export default Signup;
