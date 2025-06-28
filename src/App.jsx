import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
import Buy from "./pages/Buy";



function App() {
  return (
    <Routes>
      {/* Redirect from / to /signup */}
      <Route path="/" element={<Navigate to="/Login" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} /> 
      <Route path="/buy" element={<Buy />} />
      
    </Routes>
  );
}

export default App;
