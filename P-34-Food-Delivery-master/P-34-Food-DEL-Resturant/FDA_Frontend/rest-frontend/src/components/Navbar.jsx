// src/components/Navbar.jsx
import React from "react";
import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* 🍔 Hamburger Menu */}
        <div
          className={`hamburger ${isSidebarOpen ? "active" : ""}`}
          onClick={toggleSidebar}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <h2 className="navbar-logo">🍴 FoodStack - Restaurant</h2>
      </div>
      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
