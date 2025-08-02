import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { Mail, Lock, Chrome } from 'lucide-react';

const DeliveryLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useDeliveryAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const result = await login(formData.email.trim(), formData.password);
    console.log('Login result:', result);
    setLoading(false);

    if (result.success) {
      navigate('/delivery/dashboard');
    } else {
      setErrors({ general: result.error });
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = "http://localhost:8080";
    const userType = "DELIVERYPARTNER";
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
            window.location.href = "/delivery/dashboard";
          } else {
            setErrors({ general: 'Google login failed. Please try again or use email/password login.' });
          }
        }).catch(() => {
          setErrors({ general: 'Google login failed. Please try again or use email/password login.' });
        });
      }
    };

    window.addEventListener("message", receiveMessage, { once: true });

    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close();
        setErrors({ general: 'Google login timed out. Please try again.' });
      }
    }, 30000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Delivery Partner Login</h2>
          <p className="mt-2 text-gray-600">Sign in to your delivery partner account</p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full py-3 border border-gray-300 rounded-lg"
                required
              />
              {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 w-full py-3 border border-gray-300 rounded-lg"
                required
              />
              {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 rounded-lg"
          >
            <Chrome className="h-5 w-5" />
            <span>Sign in with Google</span>
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/delivery/register" className="font-medium text-orange-600 hover:text-orange-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryLogin;