import axiosInstance from './axiosInstance';

export const login = async (email, password, userType) => {
  const response = await axiosInstance.post('/auth/login', {
    username: email,
    password,
    userType,
  });
  return response.data;
};

export const register = async (role, data) => {
  const response = await axiosInstance.post(`/auth/register/${role}`, data);
  return response.data;
};

// Google login (frontend-only, as before)
export const loginWithGoogle = async (googleToken) => {
  // Send the Google token to your backend for verification and session creation
  const response = await axiosInstance.post('/auth/google', { token: googleToken });
  // Store the backend-issued token
  localStorage.setItem('token', response.data.token);
  return response.data;
}; 