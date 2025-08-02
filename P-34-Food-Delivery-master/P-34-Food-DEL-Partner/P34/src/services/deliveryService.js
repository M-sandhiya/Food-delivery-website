import axiosInstance from './axiosInstance';

const API_BASE_URL = 'https://api.fooddelivery.com'; // Replace with your actual API URL

export const deliveryService = {
  async getAvailableOrders() {
    // Use geolocation and call backend for real data
    return await this.getAvailableOrdersNearby();
  },

  async getAvailableOrdersNearby() {
    // For now, use hardcoded BTM location remove after testing
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => reject(err)
      );
    });
    const response = await axiosInstance.post('/rider/getAvailableOrders', position);
    return response.data;
  },

  async acceptOrder(orderId) {
    const response = await axiosInstance.put('/rider/acceptOrder', orderId, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getOrderDetails(orderId) {
    const response = await axiosInstance.get(`/rider/acceptedOrderDetails/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(partnerId, orderId, newStatus) {
    try {
      if (newStatus === 'ON_THE_WAY') {
        // Call /rider/orderPickup endpoint
        const response = await axiosInstance.put('/rider/orderPickup', orderId, {
          headers: { 'Content-Type': 'application/json' }
        });
        return { message: 'Order status updated to ON_THE_WAY', ...response.data };
      } else if (newStatus === 'DELIVERED') {
        // Call /rider/orderDelivered endpoint
        const response = await axiosInstance.put('/rider/orderDelivered', orderId, {
          headers: { 'Content-Type': 'application/json' }
        });
        return { message: 'Order status updated to DELIVERED', ...response.data };
      } else {
        // Fallback or for other statuses, keep mock or extend as needed
        return { message: `Order status updated to ${newStatus}` };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update order status');
    }
  },

  async getDeliveredOrders(partnerId) {
    try {
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              orderId: 'ord565',
              deliveredAt: '2025-01-20T18:55:00',
              restaurantName: 'Biryani House',
              customerName: 'Balaji Narayanan',
              deliveryTime: '32 mins',
              paymentMethod: 'UPI',
              amount: 360,
              customerRating: 4.5
            },
            {
              orderId: 'ord564',
              deliveredAt: '2025-01-20T16:30:00',
              restaurantName: 'Pizza Corner',
              customerName: 'Priya Sharma',
              deliveryTime: '28 mins',
              paymentMethod: 'COD',
              amount: 450,
              customerRating: 5.0
            }
          ]);
        }, 1000);
      });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order history');
    }
  },

  async getDeliveredOrdersByDateRange(startDate, endDate) {
    try {
      const response = await axiosInstance.get('/rider/deliveredOrdersByRider', {
        params: {
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch delivered orders');
    }
  },

  async updateProfile(partnerId, profileData) {
    try {
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'Profile updated successfully'
          });
        }, 800);
      });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }
};