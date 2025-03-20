import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import MessManagement from "./pages/MessManagement";

const App = () => {
  return (
    <Router>
      <Navbar /> {/* ✅ Navbar appears on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mess-management" element={<MessManagement />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
