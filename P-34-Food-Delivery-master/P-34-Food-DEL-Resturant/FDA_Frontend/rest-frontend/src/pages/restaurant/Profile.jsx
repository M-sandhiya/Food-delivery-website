import React, { useState, useEffect } from 'react';
import { getRestaurantProfile, updateRestaurantProfile, getRestaurantAddresses, addRestaurantAddress, updateRestaurantAddress, deleteRestaurantAddress } from '../../api/restaurantApi';
import '../../styles/profile.css';

const defaultProfile = {
  username: '',
  restaurantName: '',
  description: '',
  email: '',
  phone: '',
  enabled: true, // use enabled for open for orders
  rating: '',
};

const defaultAddress = {
  id: '',
  fulladdress: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  AddressName: '',
  landmark: '',
  latitude: '',
  longitude: '',
  isActive: true,
  defaultAddress: true,
};

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultProfile);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [address, setAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(defaultAddress);
  const [addressEditing, setAddressEditing] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    setLoading(true);
    getRestaurantProfile()
      .then(res => {
        const data = res.data.r || res.data;
        setProfile(data);
        setForm({
          ...defaultProfile,
          ...data,
        });
        setImagePreview(data.restaurantPic || '');
        setLoading(false);
        // Fetch address for this restaurant
        if (data.id) {
          fetchAddress(data.id);
        }
      })
      .catch(err => {
        setError('Failed to load profile.');
        setLoading(false);
      });
  }, []);

  const fetchAddress = async (id) => {
    setAddressLoading(true);
    setAddressError('');
    try {
      const res = await getRestaurantAddresses(id);
      // Assume backend returns an array, but only one address is allowed
      const addr = Array.isArray(res.data) ? res.data[0] : res.data;
      setAddress(addr || null);
      setAddressForm(addr || defaultAddress);
    } catch (err) {
      setAddressError('Failed to load address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        username: form.username,
        restaurantName: form.restaurantName,
        description: form.description,
        email: form.email,
        phone: form.phone,
        enabled: form.enabled, // map enabled
        rating: form.rating,
      };
      const res = await updateRestaurantProfile(payload, imageFile);
      const data = res.data.r || res.data;
      setProfile(data);
      setForm({
        ...defaultProfile,
        ...data,
      });
      setImagePreview(data.restaurantPic || '');
      setEditing(false);
      setImageFile(null);
      alert('✅ Profile updated!');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError('');
    try {
      if (address && address.id) {
        // If address exists, always update
        await updateRestaurantAddress({ ...addressForm, id: address.id });
      } else {
        // Only add if no address exists
        const addressToAdd = { ...addressForm };
        delete addressToAdd.id;
        await addRestaurantAddress(addressToAdd);
      }
      if (profile?.id) fetchAddress(profile.id);
      setAddressEditing(false);
    } catch (err) {
      setAddressError('Failed to save address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressEdit = () => {
    setAddressEditing(true);
    setAddressForm(address);
  };

  const handleAddressDelete = async () => {
    if (!address) return;
    if (!window.confirm('Are you sure you want to delete the address?')) return;
    setAddressLoading(true);
    setAddressError('');
    try {
      await deleteRestaurantAddress(address);
      setAddress(null);
      setAddressForm(defaultAddress);
      setAddressEditing(false);
    } catch (err) {
      setAddressError('Failed to delete address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setForm(profile ? { ...defaultProfile, ...profile } : defaultProfile);
    setImageFile(null);
    setImagePreview(profile?.restaurantPic || '');
  };

  // Geolocation: Use My Location
  const handleUseMyLocation = () => {
    setGeoLoading(true);
    setGeoError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Reverse geocode to get address fields
          try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.status === 'OK' && data.results.length > 0) {
              const result = data.results[0];
              const components = result.address_components;
              // Helper to get component by type
              const getComp = (type) => {
                const comp = components.find(c => c.types.includes(type));
                return comp ? comp.long_name : '';
              };
              setAddressForm((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                fulladdress: result.formatted_address || prev.fulladdress,
                street: getComp('route') || prev.street,
                city: getComp('locality') || getComp('administrative_area_level_2') || prev.city,
                state: getComp('administrative_area_level_1') || prev.state,
                pincode: getComp('postal_code') || prev.pincode,
                country: getComp('country') || prev.country,
                landmark: getComp('sublocality') || getComp('neighborhood') || prev.landmark,
              }));
            } else {
              setGeoError('Could not reverse geocode location.');
            }
          } catch (err) {
            setGeoError('Error contacting geocoding service.');
          }
          setGeoLoading(false);
        },
        (error) => {
          setGeoError('Unable to fetch location.');
          setGeoLoading(false);
        }
      );
    } else {
      setGeoError('Geolocation is not supported by this browser.');
      setGeoLoading(false);
    }
  };

  // Geocoding: Get Lat/Lng from Address using Google Maps API
  const handleGeocodeAddress = async () => {
    setGeoLoading(true);
    setGeoError('');
    try {
      const addressString = [
        addressForm.fulladdress,
        addressForm.street,
        addressForm.city,
        addressForm.state,
        addressForm.pincode,
        addressForm.country
      ].filter(Boolean).join(', ');
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const loc = data.results[0].geometry.location;
        setAddressForm((prev) => ({
          ...prev,
          latitude: loc.lat,
          longitude: loc.lng,
        }));
      } else {
        setGeoError('Could not geocode address.');
      }
    } catch (err) {
      setGeoError('Error contacting geocoding service.');
    } finally {
      setGeoLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading...</p></div>;
  }
  if (error) {
    return <div className="profile-container"><p style={{color:'red'}}>{error}</p></div>;
  }
  if (!profile) {
    return <div className="profile-container"><p>No profile data found.</p></div>;
  }

  return (
    <div className="profile-container enhanced-profile">
      <h2 className="profile-title">🧾 Restaurant Profile</h2>
      <div className="restaurant-image-block always-center full-width-image-block">
        <div className="restaurant-image-wrapper full-width-image">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Restaurant"
              className="restaurant-img-full"
            />
          ) : (
            <div className="restaurant-img-placeholder">No Image</div>
          )}
          {editing && (
            <input type="file" accept="image/*" onChange={handleImageChange} className="restaurant-img-input" />
          )}
        </div>
        <div className="restaurant-image-caption">
          {editing ? 'Change Restaurant Image' : 'Restaurant Image'}
        </div>
      </div>
      {/* Edit button outside the form, only enables editing */}
      {!editing && (
        <div className="profile-actions enhanced-actions always-center">
          <button type="button" className="profile-btn edit-btn" onClick={handleEdit}>
            ✏️ Edit Profile
          </button>
        </div>
      )}
      <form className="profile-form enhanced-form" onSubmit={handleSubmit}>
        <div className="profile-section">
          <div className="profile-fields-block">
        <label>
              <span>Username:</span>
          <input
                name="username"
            type="text"
                value={form.username}
            onChange={handleChange}
            disabled={!editing}
            required
                className="profile-input"
              />
            </label>
            <label>
              <span>Restaurant Name:</span>
              <input
                name="restaurantName"
                type="text"
                value={form.restaurantName}
                onChange={handleChange}
                disabled={!editing}
                className="profile-input"
              />
            </label>
            <label>
              <span>Description:</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={!editing}
                rows={3}
                className="profile-input"
          />
        </label>
        <label>
              <span>Email:</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled
                className="profile-input"
          />
        </label>
        <label>
              <span>Phone:</span>
          <input
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            disabled={!editing}
                className="profile-input"
          />
        </label>
            <div className="profile-switch-row">
        <label>
                <span>Open for Orders:</span>
          <input
                  type="checkbox"
                  name="enabled"
                  checked={!!form.enabled}
            onChange={handleChange}
            disabled={!editing}
          />
        </label>
            </div>
        <label>
              <span>Rating:</span>
          <input
                name="rating"
                type="number"
                value={form.rating || ''}
                readOnly
                className="profile-input"
                style={{ background: '#f3f3f3', color: '#888', cursor: 'not-allowed' }}
          />
        </label>
          </div>
        </div>
          {editing && (
          <div className="profile-actions enhanced-actions">
            <button type="submit" className="profile-btn save-btn">💾 Save Changes</button>
              <button
                type="button"
              className="profile-btn cancel-btn"
                onClick={() => {
                setForm(profile ? { ...defaultProfile, ...profile } : defaultProfile);
                  setEditing(false);
                setImagePreview(profile?.restaurantPic || '');
                setImageFile(null);
                }}
              >
              ❌ Cancel
              </button>
          </div>
        )}
      </form>
      {/* Address Section */}
      <div className="address-section">
        <h3 className="address-title">📍 Restaurant Address</h3>
        {addressLoading && <p>Loading address...</p>}
        {addressError && <p style={{ color: 'red' }}>{addressError}</p>}
        {geoError && <p style={{ color: 'red' }}>{geoError}</p>}
        {address && !addressEditing ? (
          <div className="address-card">
            <div>{address.fulladdress}</div>
            <div>{address.street}, {address.city}, {address.state}, {address.pincode}, {address.country}</div>
            {address.landmark && <div>Landmark: {address.landmark}</div>}
            <div className="address-actions">
              <button className="profile-btn edit-btn" onClick={handleAddressEdit}>Edit</button>
              <button className="profile-btn cancel-btn" onClick={handleAddressDelete}>Delete</button>
            </div>
          </div>
        ) : (
          <form className="address-form" onSubmit={handleAddressSubmit}>
            <div className="address-fields">
              <input
                type="text"
                name="fulladdress"
                placeholder="Full Address"
                value={addressForm.fulladdress}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="street"
                placeholder="Street"
                value={addressForm.street}
                onChange={handleAddressChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={addressForm.city}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={addressForm.state}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={addressForm.pincode}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={addressForm.country}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="landmark"
                placeholder="Landmark (optional)"
                value={addressForm.landmark}
                onChange={handleAddressChange}
              />
              <div className="latlng-actions">
                <button type="button" className="profile-btn edit-btn" onClick={handleUseMyLocation} disabled={geoLoading}>Use My Location</button>
                <button type="button" className="profile-btn edit-btn" onClick={handleGeocodeAddress} disabled={geoLoading}>Get Lat/Lng from Address</button>
              </div>
            </div>
            <div className="address-actions">
              <button type="submit" className="profile-btn save-btn">{addressEditing ? 'Update Address' : 'Add Address'}</button>
              {addressEditing && (
                <button type="button" className="profile-btn cancel-btn" onClick={() => { setAddressEditing(false); setAddressForm(address); }}>Cancel</button>
          )}
        </div>
      </form>
        )}
      </div>
    </div>
  );
};

export default Profile;