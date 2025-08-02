import React, { createContext, useContext, useEffect, useState } from 'react';

const RiderLocationContext = createContext();

export const useRiderLocation = () => useContext(RiderLocationContext);

export const RiderLocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setShowLocationPopup(false);
        },
        (err) => {
          setShowLocationPopup(true);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    } else {
      setShowLocationPopup(true);
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <RiderLocationContext.Provider value={location}>
      {showLocationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full text-center">
            <h2 className="text-lg font-bold text-red-600 mb-2">Location Required</h2>
            <p className="text-gray-700 mb-4">Please enable location services to use the app. This app requires your location to function properly for deliveries.</p>
            <button
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {children}
    </RiderLocationContext.Provider>
  );
}; 