import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { Mail, Lock, Chrome } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
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
    // Always trim email and send userType 'CUSTOMER'
    const result = await login(formData.email.trim(), formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ general: result.error });
    }
  };
  
  const handleGoogleLogin = () => {
    const backendUrl = "http://localhost:8080"; // Your backend URL
    const userType = "CUSTOMER"; // Or "RIDER", "RESTAURANT", etc.
    const oauthUrl = `${backendUrl}/oauth2/authorization/google?userType=${userType}`;

    // Open popup
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      oauthUrl,
      "GoogleOAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for message from popup
    const receiveMessage = (event) => {
      // Optionally check event.origin for security
      if (event.data && event.data.token) {
        // Use the AuthContext to handle Google login
        loginWithGoogle(event.data.token).then(result => {
          if (result.success) {
            window.location.href = "/";
          } else {
            // Handle OAuth2 login failure
            console.error('Google login failed:', result.error);
            setErrors({ general: 'Google login failed. Please try again or use email/password login.' });
          }
        }).catch(error => {
          console.error('Google login error:', error);
          setErrors({ general: 'Google login failed. Please try again or use email/password login.' });
        });
      }
    };

    window.addEventListener("message", receiveMessage, { once: true });
    
    // Add timeout to check if popup is blocked or failed
    setTimeout(() => {
      if (popup && !popup.closed) {
        console.log("Popup is still open - user may need to close it manually");
        popup.close();
        setErrors({ general: 'Google login timed out. Please try again.' });
      }
    }, 30000); // 30 seconds timeout
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
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
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Sign In
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Chrome className="h-5 w-5" />
            <span>Sign in with Google</span>
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;