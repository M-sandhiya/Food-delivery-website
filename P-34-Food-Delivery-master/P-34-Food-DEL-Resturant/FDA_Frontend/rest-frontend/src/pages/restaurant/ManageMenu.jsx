import React, { useEffect, useState } from 'react';
import '../../styles/manageMenu.css';
import { getDishes, addDish, modifyDish, deleteDish } from '../../api/restaurantApi';

const defaultForm = {
  id: '',
  name: '',
  description: '',
  price: '',
  category: '',
  cusine: '',
  available: true,
};

const ManageMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDishes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDishes();
      setDishes(res.data || []);
    } catch (err) {
      setError('Failed to load dishes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDishes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const dishData = {
        id: editingId,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        cusine: form.cusine,
        available: form.available,
      };
      if (editingId) {
        await modifyDish(dishData, imageFile);
      } else {
        await addDish(dishData, imageFile);
      }
      await loadDishes();
      setForm(defaultForm);
      setImageFile(null);
      setImagePreview('');
      setEditingId(null);
    } catch (err) {
      setError('Failed to save dish.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dish) => {
    setForm({
      id: dish.id,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      category: dish.category,
      cusine: dish.cusine,
      available: dish.available,
    });
    setImageFile(null);
    setImagePreview(dish.image || '');
    setEditingId(dish.id);
  };

  const handleDelete = async (dish) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      setLoading(true);
      setError('');
      try {
        await deleteDish({ id: dish.id });
        await loadDishes();
      } catch (err) {
        setError('Failed to delete dish.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  return (
    <div className="menu-container">
      <h2>🍽️ Manage Menu</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      <form className="menu-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Dish Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          placeholder="Price"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="Category (e.g., Starter, Main Course)"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="Cuisine (e.g., Indian, Chinese)"
          name="cusine"
          value={form.cusine}
          onChange={handleChange}
          required
        />
        <div className="image-upload-block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="dish-image-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="dish-image-input" className="choose-image-btn">
            {imagePreview ? 'Change Image' : 'Choose Image'}
          </label>
          {imagePreview && (
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="Preview" className="preview-image" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => { setImageFile(null); setImagePreview(''); }}
              >
                ✖
              </button>
            </div>
          )}
          {imageFile && (
            <div className="file-name">{imageFile.name}</div>
          )}
        </div>
        <label className="availability-label">
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={handleChange}
          />
          Available
        </label>
        <button type="submit" disabled={loading}>
          {editingId ? 'Update Dish' : 'Add Dish'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
        )}
      </form>
      <div className="menu-list">
        {dishes.length === 0 ? (
          <p>No dishes added yet.</p>
        ) : (
          dishes.map((dish) => (
            <div key={dish.id} className="dish-card">
              <img src={dish.image} alt={dish.name} />
              <div>
                <h4>{dish.name}</h4>
                <p>{dish.description}</p>
                <p>₹ {dish.price}</p>
                <p>Category: {dish.category}</p>
                <p>Cuisine: {dish.cusine}</p>
                <p>Status: {dish.available ? 'Available' : 'Unavailable'}</p>
              </div>
              <div className="dish-actions">
                <button onClick={() => handleEdit(dish)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(dish)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageMenu;
