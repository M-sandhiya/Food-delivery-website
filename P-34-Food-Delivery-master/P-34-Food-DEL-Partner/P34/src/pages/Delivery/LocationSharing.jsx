import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Play, Square } from 'lucide-react';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { trackingService } from '../../services/trackingService';

const LocationSharing = ({ orderId }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const { partner } = useDeliveryAuth();
  const [isLocationSharing, setIsLocationSharing] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (watchId) {
        trackingService.stopLocationTracking(watchId);
      }
    };
  }, [watchId]);

  const handleStartTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    const id = trackingService.startLocationTracking(
      partner.id,
      orderId,
      (location) => {
        setCurrentLocation(location);
        setLocationError(null);
      }
    );

    setWatchId(id);
    setIsLocationSharing(true);
  };

  const handleStopTracking = () => {
    if (watchId) {
      trackingService.stopLocationTracking(watchId);
      setWatchId(null);
    }
    setIsLocationSharing(false);
    setCurrentLocation(null);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Navigation className="w-5 h-5 text-blue-500 mr-2" />
        Live Location Sharing
      </h3>

      {locationError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {locationError}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button
          onClick={handleStartTracking}
          disabled={isLocationSharing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Sharing
        </button>
        <button
          onClick={handleStopTracking}
          disabled={!isLocationSharing}
          className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop Sharing
        </button>
      </div>

      {isLocationSharing && currentLocation && (
        <div className="mt-4 text-sm text-gray-700">
          <MapPin className="w-4 h-4 inline mr-1 text-blue-500" />
          Sharing location: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default LocationSharing;