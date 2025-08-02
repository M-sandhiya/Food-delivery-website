import axiosInstance from './axiosInstance';

export const authService = {
  async login(username, password, userType) {
    try {
      const response = await axiosInstance.post('/auth/login', {
        username,
        password,
        userType
      });
      // response.data: { token: "..." }
      return response.data;
    } catch (error) {
      // If backend sends error as plain text
      const errorMsg = error.response && error.response.data ? error.response.data : 'Login failed';
      throw new Error(errorMsg);
    }
  },

  async register(role, userData) {
    try {
      const response = await axiosInstance.post(`/auth/register/${role}`, userData);
      // Backend returns plain text "Registered" or error
      return { message: response.data };
    } catch (error) {
      const errorMsg = error.response && error.response.data ? error.response.data : 'Registration failed';
      throw new Error(errorMsg);
    }
  }
};