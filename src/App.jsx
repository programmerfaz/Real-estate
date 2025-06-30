import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
import Buy from "./pages/buy";
import Favorites from "./pages/Favourites";
import AIHelp from "./pages/AIHelp";


function App() {
  return (
    <Routes>
      {/* Redirect from / to /signup */}
      <Route path="/" element={<Navigate to="/Login" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} /> 
      <Route path="/buy" element={<Buy />} />
      <Route path="/favourites" element={<Favorites />} />
      <Route path="/AIHelp" element={<AIHelp />} />
      {/* Catch-all route to redirect to home if no other route matches */}
    </Routes>
  );
}

export default App;