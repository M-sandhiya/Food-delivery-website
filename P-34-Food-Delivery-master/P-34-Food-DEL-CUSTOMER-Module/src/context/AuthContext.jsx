import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, loginWithGoogle as apiLoginWithGoogle } from '../services/authApi';
import { getCustomerDetails } from '../services/customerApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('token');
    if (token) {
      getCustomerDetails().then((data) => {
        console.log('Customer details received:', data);
        setUser(data);
        setLoading(false);
      }).catch((error) => {
        console.error('Error fetching customer details:', error);
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const result = await apiLogin(username.trim(), password, 'CUSTOMER');
      if (result.token) {
        localStorage.setItem('token', result.token);
        const userData = await getCustomerDetails();
        console.log('Customer details after login:', userData);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const loginWithGoogle = async (token) => {
    try {
      const result = await apiLoginWithGoogle(token);
      if (result.token) {
        localStorage.setItem('token', result.token);
        const userData = await getCustomerDetails();
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Google login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Google login failed' };
    }
  };

  const register = async (role, userData) => {
    try {
      const result = await apiRegister(role, userData);
      return result;
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};