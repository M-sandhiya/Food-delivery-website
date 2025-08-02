import axiosInstance from './axiosInstance';

// Register a new user (role: CUSTOMER, RESTAURANT, ADMIN, RIDER)
export const register = (role, data) =>
  axiosInstance.post(`/auth/register/${role}`, data);

// Login user
export const login = (data) =>
  axiosInstance.post('/auth/login', data);

// Google OAuth2 login (this will be a redirect, not a POST)
export const googleLogin = (userType) => {
  const url = `http://localhost:8080/oauth2/authorization/google?userType=${userType}`;
  window.open(url, '_blank', 'width=500,height=600');
}; 