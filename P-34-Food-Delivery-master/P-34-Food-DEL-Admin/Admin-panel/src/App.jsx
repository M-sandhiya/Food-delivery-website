// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import React, { useState, useEffect } from "react";
import "./index.css";

// Import child components
import Sidebar from "./components/Sidebar.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ManageUsers from "./components/ManageUsers.jsx";
import ManageOrders from "./components/ManageOrders.jsx";
import ManageRestaurants from "./components/ManageRestaurants.jsx";
import ReportAnalysis from "./components/ReportAnalysis.jsx";

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
        {activeModule === "ReportAnalysis" && <ReportAnalysis />}
      </main>
    </div>
  );
}

export default App;
