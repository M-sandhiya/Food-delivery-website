export const trackingService = {
  async shareLocation(partnerId, orderId, currentLocation) {
    try {
      // Mock API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'Location updated successfully'
          });
        }, 200);
      });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to share location');
    }
  },

  startLocationTracking(partnerId, orderId, callback) {
    let watchId = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          callback(location);
          
          // Share location with server
          this.shareLocation(partnerId, orderId, {
            ...location,
            timestamp: new Date().toISOString()
          }).catch(console.error);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    }

    return watchId;
  },

  stopLocationTracking(watchId) {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
};