// src/layouts/RestaurantLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/layout.css';

const RestaurantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-container">
      {/* ✅ Pass isSidebarOpen to Navbar */}
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="app-body">
        {/* Sidebar visible only if sidebarOpen is true */}
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Main content */}
        <main className="app-content"   style={{ marginLeft: sidebarOpen ? 0 : 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default RestaurantLayout;
