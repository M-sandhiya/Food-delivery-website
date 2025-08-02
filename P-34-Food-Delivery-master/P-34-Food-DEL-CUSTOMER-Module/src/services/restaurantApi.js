import axiosInstance from './axiosInstance';

export const getRestaurants = async () => {
  const response = await axiosInstance.get('/restaurants'); // Adjust endpoint if needed
  return response.data;
};

export const getRestaurantById = async (id) => {
  const response = await axiosInstance.get(`/restaurants/${id}`); // Adjust endpoint if needed
  return response.data;
};

export const searchRestaurants = async (query, location) => {
  // Adjust endpoint and params as needed for your backend
  const response = await axiosInstance.get('/restaurants/search', {
    params: { query, location }
  });
  return response.data;
};

export const getRestaurantsByCategory = async (categoryId) => {
  // Adjust endpoint as needed for your backend
  const response = await axiosInstance.get(`/categories/${categoryId}/restaurants`);
  return response.data;
};

export const getRestaurantByIdWithCategory = async (id, categoryId) => {
  // Adjust endpoint as needed for your backend
  const response = await axiosInstance.get(`/restaurants/${id}?categoryId=${categoryId}`);
  return response.data;
};

export const getRestaurantsByLocation = async (lat, lon, radius, searchName = '') => {
  try {
    const params = { lat, lon, radius };
    if (searchName && searchName.trim() !== '') params.searchName = searchName;
    const response = await axiosInstance.get('/customer/restaurantAtLocation', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 

export const getRestaurantDishDetails = async (restaurantId) => {
  const response = await axiosInstance.get(`/restaurantDetails?rId=${restaurantId}`);
  return response.data; // { cuisine: [dishes] }
};

export const getCustomerRestaurantDetails = async (restaurantId) => {
  const response = await axiosInstance.get(`/customer/restaurantDetails?rId=${restaurantId}`);
  return response.data; // { cuisine: [dishes] }
}; 