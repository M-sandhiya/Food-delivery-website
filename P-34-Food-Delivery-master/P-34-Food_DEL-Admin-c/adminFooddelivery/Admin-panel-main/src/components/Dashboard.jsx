import React, { useEffect, useState } from "react";
import api from "../api";

function Dashboard() {
  const [stats, setStats] = useState([
    { title: "Total Users", value: 0, icon: "fas fa-users", bg: "bg-orange-600" },
    { title: "Total Orders", value: 0, icon: "fas fa-shopping-cart", bg: "bg-orange-700" },
    { title: "Restaurants", value: 0, icon: "fas fa-utensils", bg: "bg-orange-600" },
    { title: "Riders", value: 0, icon: "fas fa-motorcycle", bg: "bg-orange-700" },
    { title: "Transactions", value: 0, icon: "fas fa-exchange-alt", bg: "bg-orange-600" },
    { title: "Admins", value: 0, icon: "fas fa-user-shield", bg: "bg-orange-700" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/counts");
        const data = res.data;
        setStats([
          { title: "Total Users", value: (data.customers || 0) + (data.riders || 0), icon: "fas fa-users", bg: "bg-orange-600" },
          { title: "Total Orders", value: data.orders || 0, icon: "fas fa-shopping-cart", bg: "bg-orange-700" },
          { title: "Restaurants", value: data.restaurants || 0, icon: "fas fa-utensils", bg: "bg-orange-600" },
          { title: "Riders", value: data.riders || 0, icon: "fas fa-motorcycle", bg: "bg-orange-700" },
          { title: "Transactions", value: data.transactions || 0, icon: "fas fa-exchange-alt", bg: "bg-orange-600" },
          { title: "Admins", value: data.admins || 0, icon: "fas fa-user-shield", bg: "bg-orange-700" },
        ]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard stats");
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

        return (
          <div className="p-6 flex-grow overflow-auto">
      <h1 className="text-3xl font-semibold mb-6 text-orange-900">Dashboard</h1>
      {loading ? (
        <div className="text-center text-orange-700">Loading stats...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(({ title, value, icon, bg }) => (
                <div
                  key={title}
                  className={`flex items-center gap-4 p-6 rounded-lg shadow-md text-white ${bg}`}
                >
                  <div className="text-4xl opacity-80">
                    <i className={icon}></i>
                  </div>
                  <div>
                    <p className="text-lg font-medium">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
      )}
      {/* You can update the Recent Orders section similarly to fetch real data if needed */}
          </div>
        );
      }
export default Dashboard;