import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../auth/localAuth";
import "../App.css";

const SHOW_GOOGLE_AUTH = false;

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await registerUser(email, password);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="hidden md:block md:w-1/2 h-full">
        <img
          src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Signup Visual"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-full bg-gray-100 px-4 py-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-6 tracking-tight">
          Wealth Home
        </h1>

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
                minLength={6}
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
                minLength={6}
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
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-md text-sm font-medium transition duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          {SHOW_GOOGLE_AUTH && (
            <>
              <div className="my-6 border-t border-gray-300" />
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Sign Up with Google
              </button>
            </>
          )}

          <button
            type="button"
            onClick={goToLogin}
            className="w-full text-sm mt-4 text-center bg-transparent border-0 cursor-pointer"
          >
            Already have an account?{" "}
            <span className="text-blue-600 hover:underline">Login</span>
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
