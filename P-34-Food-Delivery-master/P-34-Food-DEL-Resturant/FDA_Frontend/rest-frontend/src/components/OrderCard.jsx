import React from 'react';
import '../styles/orderCard.css';

const OrderCard = ({ order, onStatusChange }) => {
  return (
    <div className="order-card">
      <h3>Order #{order.id}</h3>
      <p><strong>Customer:</strong> {order.customerName}</p>
      <p><strong>Status:</strong> {order.status}</p>

      <ul className="order-items">
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <select
        className="status-dropdown"
        value={order.status}
        onChange={(e) => onStatusChange(order.id, e.target.value)}
      >
        <option value="PREPARING">Preparing</option>
        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
        <option value="DELIVERED">Delivered</option>
      </select>
    </div>
  );
};

export default OrderCard;
