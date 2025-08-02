import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Clock, Route } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '320px', // slightly smaller for mobile
  maxWidth: '100vw',
  borderRadius: '1rem',
};

const DeliveryMap = ({ restaurant, customer, currentLocation, orderStatus }) => {
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  // Center on rider if available, else restaurant
  const center = currentLocation || restaurant?.location || { lat: 12.9716, lng: 77.5946 };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const calculateRoute = useCallback(() => {
    if (!restaurant?.location || !customer?.location || !currentLocation) return;

    const directionsService = new window.google.maps.DirectionsService();

    let origin, destination;
    if (orderStatus === 'PICKED_UP' || orderStatus === 'ON_THE_WAY') {
      origin = currentLocation;
      destination = customer.location;
    } else {
      origin = currentLocation;
      destination = restaurant.location;
    }

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setDistance(leg.distance.text);
            setDuration(leg.duration.text);
          } else {
            setDistance(null);
            setDuration(null);
          }
        }
      }
    );
  }, [restaurant, customer, currentLocation, orderStatus]);

  useEffect(() => {
    if (map && restaurant && customer && currentLocation) {
      calculateRoute();
    }
  }, [map, restaurant, customer, currentLocation, calculateRoute]);

  return (
    <div>
      {(distance || duration) && (
        <div className="mb-2 flex justify-center">
          <div className="flex items-center gap-4 bg-white rounded-lg shadow p-2 border border-gray-100 text-xs sm:text-base">
            {distance && (
              <span className="flex items-center text-blue-700 font-semibold">
                <Route className="w-4 h-4 mr-1 text-blue-500" />
                Distance: {distance}
              </span>
            )}
            {duration && (
              <span className="flex items-center text-emerald-700 font-semibold">
                <Clock className="w-4 h-4 mr-1 text-emerald-500" />
                Approx. Time: {duration}
              </span>
            )}
          </div>
        </div>
      )}
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          onLoad={onLoad}
          options={{ gestureHandling: 'greedy', disableDefaultUI: true }}
        >
          {restaurant?.location && <Marker position={restaurant.location} label="R" />}
          {customer?.location && <Marker position={customer.location} label="C" />}
          {currentLocation && <Marker position={currentLocation} label="You" />}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default DeliveryMap;