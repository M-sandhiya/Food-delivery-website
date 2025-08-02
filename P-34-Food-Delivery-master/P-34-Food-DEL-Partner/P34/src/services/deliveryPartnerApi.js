import axiosInstance from './axiosInstance';

// Fetch delivery partner details (POST with empty FormData)
export const getDeliveryPartnerDetails = async () => {
  const formData = new FormData();
  const response = await axiosInstance.post('/rider/details', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Update delivery partner details (POST with multipart/form-data)
export const updateDeliveryPartnerDetails = async (updateData, profilePic) => {
  const formData = new FormData();
  if (updateData) {
    formData.append('update', new Blob([JSON.stringify(updateData)], { type: 'application/json' }));
  }
  if (profilePic) {
    formData.append('profilePic', profilePic);
  }
  const response = await axiosInstance.post('/rider/details', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}; 