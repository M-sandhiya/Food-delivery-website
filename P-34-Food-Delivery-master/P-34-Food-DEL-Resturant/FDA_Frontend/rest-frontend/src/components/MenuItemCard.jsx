import React from 'react';
import '../styles/menuItemCard.css';

const MenuItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="menu-card">
      <div className="menu-info">
        <h4>{item.name}</h4>
        <p>{item.desc}</p>
        <span>₹{item.price}</span>
      </div>
      <div className="menu-actions">
        <button onClick={() => onEdit(item)}>Edit</button>
        <button className="danger" onClick={() => onDelete(item.id)}>Delete</button>
      </div>
    </div>
  );
};

export default MenuItemCard;
