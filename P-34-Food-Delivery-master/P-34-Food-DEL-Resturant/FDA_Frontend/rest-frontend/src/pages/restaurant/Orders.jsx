import React, { useState, useEffect } from 'react';
import { 
  getCurrentOrders, 
  acceptOrRejectOrder, 
  getAcceptedOrders, 
  getDeliveredOrders, 
  updateOrderStatusRestaurant, 
  getDishes 
} from '../../api/restaurantApi';
import '../../styles/orders.css';

const STATUS_OPTIONS = [
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
];

const statusColors = {
  CREATED: '#64748b',
  PREPARING: '#f59e42',
  READY_FOR_PICKUP: '#2563eb',
  ON_THE_WAY: '#0ea5e9',
  DELIVERED: '#22c55e',
  CANCELLED: '#e53e3e',
  REJECTED: '#e53e3e',
};

const Orders = () => {
  const [currentOrders, setCurrentOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState({});
  const [statusSelect, setStatusSelect] = useState({});
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    loadOrders();
    // Fetch all dishes for dishId->name mapping
    getDishes().then(res => setDishes(res.data || []));
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const [current, accepted, delivered] = await Promise.all([
        getCurrentOrders(),
        getAcceptedOrders(),
        getDeliveredOrders()
      ]);
      setCurrentOrders(current.data || []);
      setAcceptedOrders(accepted.data || []);
      setDeliveredOrders(delivered.data || []);
    } catch (err) {
      setError('Failed to load orders.');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReject = async (orderId, accept) => {
    try {
      await acceptOrRejectOrder(orderId, accept);
      await loadOrders();
      alert(`Order ${accept ? 'accepted' : 'rejected'} successfully!`);
    } catch (err) {
      alert('Failed to update order status.');
      console.error('Error updating order:', err);
    }
  };

  const handleStatusUpdate = async (orderId) => {
    const status = statusSelect[orderId];
    if (!status) return;
    setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatusRestaurant(orderId, status);
      await loadOrders();
      alert(`Order status updated to ${status}`);
    } catch (err) {
      alert('Failed to update order status.');
      console.error('Error updating order status:', err);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Helper to filter accepted orders (ACCEPTED, READY_FOR_PICKUP, PREPARING)
  const getAcceptedOrdersFiltered = () =>
    acceptedOrders.filter(order => {
      const status = order.status ? order.status.toUpperCase() : '';
      return status === 'ACCEPTED' || status === 'READY_FOR_PICKUP' || status === 'PREPARING';
    });

  const getOrdersByTab = () => {
    switch (activeTab) {
      case 'current':
        return currentOrders;
      case 'accepted':
        return getAcceptedOrdersFiltered();
      case 'delivered':
        return deliveredOrders;
      default:
        return currentOrders;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'current':
        return 'Current Orders';
      case 'accepted':
        return 'Accepted Orders';
      case 'delivered':
        return 'Delivered Orders';
      default:
        return 'Orders';
    }
  };

  const getDishName = (dishId) => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : `Dish ID: ${dishId}`;
  };

  const renderOrderCard = (order) => {
    return (
      <div className="order-card enhanced-order-card" key={order.id}>
        <div className="order-header enhanced-order-header">
          <strong>Order #{order.id}</strong>
          <span className="order-status-badge" style={{ background: statusColors[order.status] || '#888' }}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="order-meta-row">
          <span>🕒 {new Date(order.createdAt).toLocaleString()}</span>
          <span>💰 ₹{order.amount}</span>
        </div>
        <div className="order-items">
          <p>🍽️ <b>Items:</b></p>
          <ul>
            {(order.orderDishes || []).map((item) => (
              <li key={item.id}>
                {getDishName(item.dishId)}, Quantity: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
        {order.transaction && (
          <div className="order-transaction">
            <p>💳 Payment: {order.transaction.status} ({order.transaction.typeOfPay})</p>
            <p>Paid At: {order.transaction.paidAt ? new Date(order.transaction.paidAt).toLocaleString() : 'N/A'}</p>
          </div>
        )}
        <div className="order-meta-row">
          <span>Rider Assigned: {order.riderAssigned ? 'Yes' : 'No'}</span>
          {order.deliveredAt && <span>Delivered At: {new Date(order.deliveredAt).toLocaleString()}</span>}
        </div>
        <div className="order-actions enhanced-order-actions">
          {activeTab === 'current' && (
            <>
              <button 
                className="accept-btn"
                onClick={() => handleAcceptReject(order.id, true)}
              >
                Accept
              </button>
              <button 
                className="reject-btn"
                onClick={() => handleAcceptReject(order.id, false)}
              >
                Reject
              </button>
            </>
          )}
          <div className="status-update-block">
            <select
              className="status-select"
              value={statusSelect[order.id] || ''}
              onChange={e => setStatusSelect(prev => ({ ...prev, [order.id]: e.target.value }))}
              disabled={statusUpdating[order.id]}
            >
              <option value="" disabled>Select status</option>
              {STATUS_OPTIONS.filter(opt => opt.value !== order.status).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              className="status-btn"
              disabled={statusUpdating[order.id] || !statusSelect[order.id] || statusSelect[order.id] === order.status}
              onClick={() => handleStatusUpdate(order.id)}
            >
              {statusUpdating[order.id] ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="orders-container"><p>Loading orders...</p></div>;
  }
  if (error) {
    return <div className="orders-container"><p style={{color: 'red'}}>{error}</p></div>;
  }
  const orders = getOrdersByTab();
  return (
    <div className="orders-container enhanced-orders-ui">
      <h2>📦 Order Management</h2>
      <div className="order-tabs enhanced-order-tabs">
        <button 
          className={activeTab === 'current' ? 'active' : ''}
          onClick={() => setActiveTab('current')}
        >
          Current <span className="tab-count">({currentOrders.length})</span>
        </button>
        <button 
          className={activeTab === 'accepted' ? 'active' : ''}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted <span className="tab-count">({getAcceptedOrdersFiltered().length})</span>
        </button>
        <button 
          className={activeTab === 'delivered' ? 'active' : ''}
          onClick={() => setActiveTab('delivered')}
        >
          Delivered <span className="tab-count">({deliveredOrders.length})</span>
        </button>
      </div>
      <h3 className="orders-section-title">{getTabTitle()}</h3>
      {orders.length === 0 ? (
        <p className="no-orders-msg">No {activeTab} orders found.</p>
      ) : (
        <div className="order-list enhanced-order-list">
          {orders.map(renderOrderCard)}
        </div>
      )}
    </div>
  );
};

export default Orders;