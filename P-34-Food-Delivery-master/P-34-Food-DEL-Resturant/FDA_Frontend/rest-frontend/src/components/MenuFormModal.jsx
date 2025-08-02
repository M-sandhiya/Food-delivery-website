import React, { useState, useEffect } from 'react';
import '../styles/menuFormModal.css';

const MenuFormModal = ({ item = null, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', price: '', desc: '' });

  useEffect(() => {
    if (item) setForm(item);
  }, [item]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-form" onSubmit={handleSubmit}>
        <h3>{item ? 'Edit' : 'Add'} Menu Item</h3>

        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <textarea
          name="desc"
          placeholder="Description"
          value={form.desc}
          onChange={handleChange}
          required
        />

        <div className="form-buttons">
          <button type="submit">{item ? 'Update' : 'Add'}</button>
          <button type="button" className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuFormModal;
