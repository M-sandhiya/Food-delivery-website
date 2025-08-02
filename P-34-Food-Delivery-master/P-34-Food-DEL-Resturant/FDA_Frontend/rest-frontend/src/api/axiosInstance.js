import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  // Do NOT set Content-Type here! Let browser/axios set it per request.
});

// Add a request interceptor to include JWT token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance; 