import axiosInstance from './axiosInstance';

// Delivery Partner login
export const login = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', {
    username,
    password,
    userType: 'RIDER'
  });
  return response.data;
};

// Delivery Partner registration
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register/RIDER', userData);
  return response.data;
};

// Google login for Delivery Partner
export const loginWithGoogle = async (token) => {
  // If your backend requires a call, implement it here. Otherwise, just return the token.
  return { token };
}; 