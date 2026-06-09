import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setSession } from "../auth/localAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy auth — any email/password goes through
    setSession({
      email: email.trim() || "guest@wealthhome.demo",
    });
    navigate("/home");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="hidden md:block md:w-1/2 h-full">
        <img
          src="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Signin Visual"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center justify-center w-full md:w-1/2 h-full bg-gray-100 px-4 py-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-6 tracking-tight">
          Wealth Home
        </h1>

        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide">
            Log in to unlock your next investment!!
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
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
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-gray-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Register
            </button>
          </p>

          <p className="text-center text-xs text-gray-400 mt-3">
            Demo mode — use any email and password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
