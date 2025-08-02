import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/authApi';
import { USER_ROLES } from '../constants/userRoles';
import { useAuth } from '../context/AuthContext';
import '../styles/register.css';

const Register = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    restaurantName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('❌ Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      // Map frontend fields to backend expected fields
      const payload = {
        username: formData.restaurantName, // Backend expects username for restaurant
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      };
      await registerApi(USER_ROLES.RESTAURANT, payload);
      alert('✅ Registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data || 'Registration failed.';
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Robust Google registration logic
  const handleGoogleRegister = () => {
    const backendUrl = "http://localhost:8080";
    const userType = USER_ROLES.RESTAURANT;
    const oauthUrl = `${backendUrl}/oauth2/authorization/google?userType=${userType}`;
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      oauthUrl,
      "GoogleOAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );
    const receiveMessage = (event) => {
      if (event.data && event.data.token) {
        loginWithGoogle(event.data.token).then(result => {
          if (result.success) {
            navigate('/restaurant/dashboard');
          } else {
            alert('Google registration failed. Please try again or use email/password registration.');
          }
        }).catch(() => {
          alert('Google registration failed. Please try again or use email/password registration.');
        });
      }
    };
    window.addEventListener("message", receiveMessage, { once: true });
    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close();
        alert('Google registration timed out. Please try again.');
      }
    }, 30000);
  };

  return (
    <div className="register-container">
      <h2>Register Your Restaurant</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="restaurantName"
          placeholder="Restaurant Name"
          value={formData.restaurantName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Your Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
      <div className="google-login" onClick={handleGoogleRegister}>
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
        />
        <span>Sign up with Google</span>
      </div>
      <p>
        Already have an account?{' '}
        <span onClick={() => navigate('/login')}>
          Login here
        </span>
      </p>
    </div>
  );
};

export default Register; 