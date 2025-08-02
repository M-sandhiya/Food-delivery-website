import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/authApi';
import { USER_ROLES } from '../constants/userRoles';
import '../styles/login.css';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        username: email, // Backend expects username (can be email)
        password,
        userType: USER_ROLES.RESTAURANT
      };
      const res = await loginApi(payload);
      const { token } = res.data;
      login({ token, user: { email, role: USER_ROLES.RESTAURANT } });
      navigate('/restaurant/dashboard');
    } catch (err) {
      const msg = err?.response?.data || 'Login failed.';
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Robust Google login logic
  const handleGoogleLogin = () => {
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
            alert('Google login failed. Please try again or use email/password login.');
          }
        }).catch(() => {
          alert('Google login failed. Please try again or use email/password login.');
        });
      }
    };
    window.addEventListener("message", receiveMessage, { once: true });
    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close();
        alert('Google login timed out. Please try again.');
      }
    }, 30000);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Restaurant Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="google-login" onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
          />
          <span>Sign in with Google</span>
        </div>

        <p className="register-link">
          Don&apos;t have an account?{' '}
          <span onClick={() => navigate('/register')}>Register</span>
        </p>
      </form>
    </div>
  );
};

export default Login; 