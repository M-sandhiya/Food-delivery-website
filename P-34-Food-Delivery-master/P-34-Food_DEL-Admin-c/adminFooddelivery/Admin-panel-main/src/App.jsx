import React, { useState, useEffect } from "react";
import "./index.css";
import Sidebar from "./components/Sidebar.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ManageUsers from "./components/ManageUsers.jsx";
import ManageOrders from "./components/ManageOrders.jsx";
import ManageRestaurants from "./components/ManageRestaurants.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    setLoggedIn(false);
    setActiveModule("Dashboard");
  };

  useEffect(() => {
    if (activeModule === "Logout") {
      handleLogout();
    }
  }, [activeModule]);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-orange-500 text-orange-900">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-orange-600 text-white p-4">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle menu"
          className="text-2xl"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="font-bold text-xl">FoodAdmin</div>
        <button
          onClick={() => {
            setActiveModule("Logout");
            setSidebarOpen(false);
          }}
          aria-label="Logout"
          className="text-xl"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-orange-600 text-white transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          active={activeModule}
          setActive={(comp) => {
            setActiveModule(comp);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-grow bg-orange-50 min-h-screen overflow-auto">
        {activeModule === "Dashboard" && <Dashboard />}
        {activeModule === "ManageUsers" && <ManageUsers />}
        {activeModule === "ManageOrders" && <ManageOrders />}
        {activeModule === "ManageRestaurants" && <ManageRestaurants />}
      </main>
    </div>
  );
}

export default App;
