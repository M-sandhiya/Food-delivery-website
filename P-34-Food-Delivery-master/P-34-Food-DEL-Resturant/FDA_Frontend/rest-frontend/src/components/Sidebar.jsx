import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/restaurant/dashboard"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            📊 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/restaurant/menu"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            🍽️ Manage Menu
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/restaurant/orders"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            📦 Orders
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/restaurant/profile"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            🧾 Profile
          </NavLink>
          <NavLink to="/restaurant/payout">
            <i className="icon">💰</i> Payout
          </NavLink>
          <NavLink to="/restaurant/reviews">
            <i className="icon">📝</i> Reviews
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
