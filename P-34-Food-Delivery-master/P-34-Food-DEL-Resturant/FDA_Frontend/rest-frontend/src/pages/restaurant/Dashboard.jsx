import React, { useEffect, useState } from 'react';
import { getCurrentOrders, getAcceptedOrders, getDeliveredOrders } from '../../api/restaurantApi';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    preparing: 0,
    readyForPickup: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all orders from frontend APIs
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const [current, accepted, delivered] = await Promise.all([
          getCurrentOrders(),
          getAcceptedOrders(),
          getDeliveredOrders()
        ]);
        // Merge all orders into one array
        const allOrders = [
          ...(current.data || []),
          ...(accepted.data || []),
          ...(delivered.data || [])
        ];
        setOrders(allOrders);
        // Calculate stats
        const statObj = {
          total: allOrders.length,
          accepted: allOrders.filter(o => (o.status || '').toUpperCase() === 'ACCEPTED').length,
          preparing: allOrders.filter(o => (o.status || '').toUpperCase() === 'PREPARING').length,
          readyForPickup: allOrders.filter(o => (o.status || '').toUpperCase() === 'READY_FOR_PICKUP').length,
          delivered: allOrders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED').length,
          cancelled: allOrders.filter(o => ['CANCELLED','REJECTED'].includes((o.status || '').toUpperCase())).length,
        };
        setStats(statObj);
      } catch (err) {
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="dashboard-container enhanced-dashboard">
      <h2>📊 Restaurant Dashboard</h2>
      {loading ? (
        <p>Loading dashboard...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card total">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="dashboard-stat-card accepted">
            <div className="stat-label">Accepted</div>
            <div className="stat-value">{stats.accepted}</div>
          </div>
          <div className="dashboard-stat-card preparing">
            <div className="stat-label">Preparing</div>
            <div className="stat-value">{stats.preparing}</div>
          </div>
          <div className="dashboard-stat-card ready">
            <div className="stat-label">Ready for Pickup</div>
            <div className="stat-value">{stats.readyForPickup}</div>
          </div>
          <div className="dashboard-stat-card delivered">
            <div className="stat-label">Delivered</div>
            <div className="stat-value">{stats.delivered}</div>
          </div>
          <div className="dashboard-stat-card cancelled">
            <div className="stat-label">Cancelled/Rejected</div>
            <div className="stat-value">{stats.cancelled}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
