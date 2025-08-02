import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, loginWithGoogle as apiLoginWithGoogle } from '../services/authApi';
import { getDeliveryPartnerDetails, updateDeliveryPartnerDetails } from '../services/deliveryPartnerApi';

const DeliveryAuthContext = createContext();

export const useDeliveryAuth = () => {
  const context = useContext(DeliveryAuthContext);
  if (!context) {
    throw new Error('useDeliveryAuth must be used within a DeliveryAuthProvider');
  }
  return context;
};

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

export const DeliveryAuthProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[Auth] Token in localStorage:', token);
      const decoded = decodeJwt(token);
      console.log('[Auth] Decoded JWT payload:', decoded);
      getDeliveryPartnerDetails().then((data) => {
        setPartner(data.r);
        setLoading(false);
      }).catch(() => {
        setPartner(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const result = await apiLogin(username.trim(), password);
      if (result.token) {
        localStorage.setItem('token', result.token);
        console.log('[Auth] Token after login:', result.token);
        const decoded = decodeJwt(result.token);
        console.log('[Auth] Decoded JWT payload after login:', decoded);
        const data = await getDeliveryPartnerDetails();
        setPartner(data.r);
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
        console.log('[Auth] Token after Google login:', result.token);
        const decoded = decodeJwt(result.token);
        console.log('[Auth] Decoded JWT payload after Google login:', decoded);
        const data = await getDeliveryPartnerDetails();
        setPartner(data.r);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Google login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Google login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await apiRegister(userData);
      return result;
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setPartner(null);
  };

  const updateProfile = (updatedData) => {
    setPartner((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    partner,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <DeliveryAuthContext.Provider value={value}>
      {children}
    </DeliveryAuthContext.Provider>
  );
}; 