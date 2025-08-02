import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY, MAPS_CONFIG } from '../config/maps';

// Utility functions
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    let attempts = 0;
    const maxAttempts = 2;

    const tryGetLocation = (enableHighAccuracy = true) => {
      attempts++;
      console.log(`Attempt ${attempts}: Trying with ${enableHighAccuracy ? 'high' : 'low'} accuracy...`);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position.coords);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error(`Geolocation error (attempt ${attempts}):`, error);
          
          // If high accuracy failed and we haven't tried low accuracy yet, try again
          if (enableHighAccuracy && error.code === error.POSITION_UNAVAILABLE && attempts < maxAttempts) {
            console.log('High accuracy failed, trying with low accuracy...');
            setTimeout(() => tryGetLocation(false), 1000); // Wait 1 second before retry
            return;
          }
          
          let errorMessage = 'Unable to retrieve your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location access in your browser settings and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. \n This could be due to:\n' +
                '• Device location services are disabled (check Windows Settings → Privacy → Location)\n' +
                '• No GPS signal (try going outside or near a window)\n' +
                '• Poor internet connection\n' +
                '• Browser location services are blocked\n\n' +
                'Please try again or use the search box to find your location manually.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting your location.';
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy,
          timeout: enableHighAccuracy ? 15000 : 10000, // Shorter timeout for low accuracy
          maximumAge: 300000, // 5 minutes
        }
      );
    };

    // Start with high accuracy
    tryGetLocation(true);
  });
};

// Reverse geocoding using Google Geocoding API
export const reverseGeocode = async (latitude, longitude, apiKey) => {
  try {
    console.log('Reverse geocoding for:', latitude, longitude);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    console.log('Geocoding response:', data);
    
    if (data.status !== 'OK') {
      throw new Error(`Geocoding error: ${data.status}`);
    }
    
    const result = data.results[0];
    const addressComponents = result.address_components;
    
    // Extract address components
    const street = addressComponents.find(comp => 
      comp.types.includes('route')
    )?.long_name || '';
    
    const city = addressComponents.find(comp => 
      comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
    )?.long_name || '';
    
    const state = addressComponents.find(comp => 
      comp.types.includes('administrative_area_level_1')
    )?.long_name || '';
    
    const zipCode = addressComponents.find(comp => 
      comp.types.includes('postal_code')
    )?.long_name || '';
    
    const country = addressComponents.find(comp => 
      comp.types.includes('country')
    )?.long_name || '';
    
    // Extract main area
    const mainArea =
      addressComponents.find(comp => comp.types.includes('sublocality_level_1'))?.long_name ||
      addressComponents.find(comp => comp.types.includes('sublocality'))?.long_name ||
      addressComponents.find(comp => comp.types.includes('locality'))?.long_name ||
      '';
    
    return {
      street, // Street field contains only street name
      fullAddress: result.formatted_address, // Full address field contains complete address
      city,
      state,
      zipCode,
      country,
      mainArea, // <-- add this
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

const AddressMapPicker = ({ addressForm, setAddressForm, onAddressUpdate }) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize Google Maps with Places Autocomplete
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'marker'] // Ensure marker library is loaded
    });

    loader.load().then(() => {
      const google = window.google;
      
      // If we have coordinates, use them
      const center = addressForm.latitude && addressForm.longitude 
        ? { lat: Number(addressForm.latitude), lng: Number(addressForm.longitude) }
        : MAPS_CONFIG.defaultCenter;

      const mapInstance = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: addressForm.latitude && addressForm.longitude ? MAPS_CONFIG.streetZoom : MAPS_CONFIG.defaultZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapId: MAPS_CONFIG.mapId, // <-- Use the Map ID from config
        ...MAPS_CONFIG.mapOptions,
      });

      setMap(mapInstance);

      // Initialize Places Autocomplete
      if (searchInputRef.current) {
        const autocompleteInstance = new google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'IN' }, // Restrict to India
        });

        // Handle place selection
        autocompleteInstance.addListener('place_changed', async () => {
          const place = autocompleteInstance.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            console.log('No location data for this place');
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          console.log('Place selected:', place.name, lat, lng);
          
          // Update form with new coordinates
          setAddressForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));

          // Update map center and zoom
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(MAPS_CONFIG.streetZoom);

          // Remove existing marker if it exists
          if (marker) {
            marker.map = null; // Remove from map
            setMarker(null);
          }

          // Create new marker with defensive check
          if (
            window.google &&
            window.google.maps &&
            window.google.maps.marker &&
            window.google.maps.marker.AdvancedMarkerElement
          ) {
            const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
            position: place.geometry.location,
            map: mapInstance,
            gmpDraggable: true,
          });
          setMarker(newMarker);

          // Add drag listener
          newMarker.addListener('dragend', (event) => {
            const newPosition = event.latLng;
            setAddressForm((prev) => ({
              ...prev,
              latitude: newPosition.lat(),
              longitude: newPosition.lng(),
            }));
          });
          } else {
            setMapError('Google Maps marker library failed to load. Please refresh the page.');
          }

          // Auto-fill address if available
          if (place.formatted_address) {
            console.log('Place data received:', place);
            
            // Extract address components from place
            const addressComponents = place.address_components || [];
            console.log('Address components:', addressComponents);
            
            const street = addressComponents.find(comp => 
              comp.types.includes('route')
            )?.long_name || '';
            
            const city = addressComponents.find(comp => 
              comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
            )?.long_name || '';
            
            const state = addressComponents.find(comp => 
              comp.types.includes('administrative_area_level_1')
            )?.long_name || '';
            
            const zipCode = addressComponents.find(comp => 
              comp.types.includes('postal_code')
            )?.long_name || '';
            
            const country = addressComponents.find(comp => 
              comp.types.includes('country')
            )?.long_name || '';
            
            // Use reverse geocoding as fallback if address components are missing
            if (!city && !state && !zipCode) {
              try {
                console.log('Using reverse geocoding as fallback...');
                const addressData = await reverseGeocode(lat, lng, GOOGLE_MAPS_API_KEY);
                setAddressForm((prev) => ({
                  ...prev,
                  street: addressData.street, // Street field contains only street name
                  fullAddress: place.formatted_address, // Full address field contains complete address
                  city: addressData.city,
                  state: addressData.state,
                  zipCode: addressData.zipCode,
                  country: addressData.country,
                }));
                console.log('Fallback address data:', addressData);
              } catch (error) {
                console.error('Fallback geocoding failed:', error);
                // Still set the formatted address even if fallback fails
                setAddressForm((prev) => ({
                  ...prev,
                  street: street, // Street field contains only street name
                  fullAddress: place.formatted_address, // Full address field contains complete address
                }));
              }
            } else {
              setAddressForm((prev) => ({
                ...prev,
                street: street, // Street field contains only street name
                fullAddress: place.formatted_address, // Full address field contains complete address
                city: city,
                state: state,
                zipCode: zipCode,
                country: country,
              }));
            }
            
            console.log('Final auto-filled address components:', {
              street: street,
              fullAddress: place.formatted_address,
              city,
              state,
              zipCode,
              country
            });
          }
        });

        setAutocomplete(autocompleteInstance);
      }

      // Add marker if coordinates exist
      if (addressForm.latitude && addressForm.longitude) {
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.marker &&
          window.google.maps.marker.AdvancedMarkerElement
        ) {
          const markerInstance = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: Number(addressForm.latitude), lng: Number(addressForm.longitude) },
          map: mapInstance,
          gmpDraggable: true,
        });
        setMarker(markerInstance);

        // Add drag listener
        markerInstance.addListener('dragend', (event) => {
          const position = event.latLng;
          setAddressForm((prev) => ({
            ...prev,
            latitude: position.lat(),
            longitude: position.lng(),
          }));
        });
        } else {
          setMapError('Google Maps marker library failed to load. Please refresh the page.');
        }
      }

      // Add click listener to map
      mapInstance.addListener('click', (event) => {
        const position = event.latLng;
        console.log('Map clicked at:', position.lat(), position.lng());
        
        setAddressForm((prev) => ({
          ...prev,
          latitude: position.lat(),
          longitude: position.lng(),
        }));

        // Remove existing marker if it exists
        if (marker) {
          marker.map = null; // Remove from map
          setMarker(null);
        }

        // Create new marker
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.marker &&
          window.google.maps.marker.AdvancedMarkerElement
        ) {
          const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position,
          map: mapInstance,
          gmpDraggable: true,
        });
        setMarker(newMarker);

        // Add drag listener
        newMarker.addListener('dragend', (event) => {
          const newPosition = event.latLng;
          setAddressForm((prev) => ({
            ...prev,
            latitude: newPosition.lat(),
            longitude: newPosition.lng(),
          }));
        });
        } else {
          setMapError('Google Maps marker library failed to load. Please refresh the page.');
        }
      });

    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
      setMapError('Failed to load Google Maps. Please check your API key.');
    });
  }, []);

  // Update map when coordinates change
  useEffect(() => {
    if (map && addressForm.latitude && addressForm.longitude) {
      const position = { 
        lat: Number(addressForm.latitude), 
        lng: Number(addressForm.longitude) 
      };
      
      map.setCenter(position);
      map.setZoom(MAPS_CONFIG.streetZoom);

      // Remove existing marker if it exists
      if (marker) {
        marker.map = null; // Remove from map
        setMarker(null);
      }

      // Create new marker
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.marker &&
        window.google.maps.marker.AdvancedMarkerElement
      ) {
        const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        gmpDraggable: true,
      });
      setMarker(newMarker);

      // Add drag listener
      newMarker.addListener('dragend', (event) => {
        const newPosition = event.latLng;
        setAddressForm((prev) => ({
          ...prev,
          latitude: newPosition.lat(),
          longitude: newPosition.lng(),
        }));
      });
      } else {
        setMapError('Google Maps marker library failed to load. Please refresh the page.');
      }
    }
  }, [addressForm.latitude, addressForm.longitude, map]);

  // Cleanup marker when component unmounts
  useEffect(() => {
    return () => {
      if (marker) {
        marker.map = null;
      }
    };
  }, [marker]);

  // Check location permissions
  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      return 'unknown';
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      console.log('Permission API not supported:', error);
      return 'unknown';
    }
  };

  // Handle "Use My Location" button
  const handleUseMyLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setMapError(null);
    
    try {
      // Check if we're on HTTPS (required for geolocation in most browsers)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Geolocation requires HTTPS. Please use HTTPS or localhost.');
      }
      
      // Check location permission first
      const permission = await checkLocationPermission();
      console.log('Location permission:', permission);
      
      if (permission === 'denied') {
        setMapError(
          "📍 <b>Location access is denied.</b><br/>" +
          "Please enable location permissions for this site in your browser settings and refresh the page.<br/><br/>" +
          "You can still search for your address manually or click on the map to set your location."
        );
        setIsLoadingLocation(false);
        return; // Stop further execution
      }
      
      const { latitude, longitude } = await getCurrentLocation();
      console.log('Setting location:', latitude, longitude);
      
      // Update the form with coordinates
      setAddressForm((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
      
      // If map is loaded, also update it immediately
      if (map) {
        const position = { lat: latitude, lng: longitude };
        map.setCenter(position);
        map.setZoom(MAPS_CONFIG.streetZoom);
        
        // Remove existing marker if it exists
        if (marker) {
          marker.map = null; // Remove from map
          setMarker(null);
        }

        // Create new marker
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.marker &&
          window.google.maps.marker.AdvancedMarkerElement
        ) {
          const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position,
          map,
          gmpDraggable: true,
        });
        setMarker(newMarker);
        
        // Add drag listener
        newMarker.addListener('dragend', (event) => {
          const newPosition = event.latLng;
          setAddressForm((prev) => ({
            ...prev,
            latitude: newPosition.lat(),
            longitude: newPosition.lng(),
          }));
        });
        } else {
          setMapError('Google Maps marker library failed to load. Please refresh the page.');
        }
      }
      
      // Automatically fetch and fill address details
      if (GOOGLE_MAPS_API_KEY) {
        try {
          const addressData = await reverseGeocode(latitude, longitude, GOOGLE_MAPS_API_KEY);
          console.log('Auto-filling address data:', addressData);
          setAddressForm((prev) => ({
            ...prev,
            street: addressData.street, // Street field contains only street name
            fullAddress: addressData.fullAddress, // Full address field contains complete address
            city: addressData.city,
            state: addressData.state,
            zipCode: addressData.zipCode,
            country: addressData.country,
          }));
          
          if (onAddressUpdate) {
            onAddressUpdate(addressData);
          }
        } catch (error) {
          console.error('Auto-fill address error:', error);
          // Don't show error to user, just log it
        }
      }
      
    } catch (error) {
      // Always show the error message from getCurrentLocation in the UI popup
      setMapError(error.message);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [setAddressForm, map, marker]);

  // Handle reverse geocoding
  const handleReverseGeocode = useCallback(async () => {
    if (!addressForm.latitude || !addressForm.longitude) {
      toast.error('Please set a location first (click on map or use "Use My Location")');
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      toast.warning('Please set up your Google Maps API key in the .env file to use reverse geocoding');
      return;
    }

    setIsGeocoding(true);
    setMapError(null);
    try {
      const addressData = await reverseGeocode(
        addressForm.latitude, 
        addressForm.longitude,
        GOOGLE_MAPS_API_KEY
      );
      
      console.log('Setting address data:', addressData);
      setAddressForm((prev) => ({
        ...prev,
        street: addressData.street, // Street field contains only street name
        fullAddress: addressData.fullAddress, // Full address field contains complete address
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        country: addressData.country,
      }));
      
      if (onAddressUpdate) {
        onAddressUpdate(addressData);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setMapError(error.message);
      toast.error('Failed to fetch address details. Please fill manually.');
    } finally {
      setIsGeocoding(false);
    }
  }, [addressForm.latitude, addressForm.longitude, setAddressForm, onAddressUpdate]);

  // Add this function inside your component
  const handleTryAgain = () => {
    setMapError(null);
    setTimeout(() => {
      handleUseMyLocation();
    }, 0);
  };

  return (
    <div className="space-y-4 relative">
      {/* Error Popup Overlay */}
      {mapError && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="p-8 bg-white border-2 border-red-400 text-red-700 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center animate-fade-in">
            <div className="flex items-center mb-4">
              <span className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mr-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
              </span>
              <span className="text-xl font-bold text-red-700">Map Error</span>
            </div>
            <div className="mb-6 w-full text-center whitespace-pre-line text-base leading-relaxed text-gray-800">
              {mapError}
            </div>
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={handleTryAgain}
                className="px-5 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => setMapError(null)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Warning */}
      {!GOOGLE_MAPS_API_KEY && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-bold">Setup Required:</p>
          <p>Please add your Google Maps API key to the .env file as VITE_GOOGLE_MAPS_API_KEY to enable all features.</p>
        </div>
      )}

      {/* Search Location */}
      <div className="space-y-2">
        <label htmlFor="location-search" className="block text-sm font-medium text-gray-700">
          Search for a location
        </label>
        <div className="relative">
          <input
            ref={searchInputRef}
            id="location-search"
            type="text"
            placeholder="Search for an address, place, or landmark..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLoadingLocation}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoadingLocation ? 'Getting Location...' : 'Use My Location'}
        </button>
        
        <button
          type="button"
          onClick={handleReverseGeocode}
          disabled={isGeocoding || !addressForm.latitude || !addressForm.longitude}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isGeocoding ? 'Fetching Address...' : 'Auto-fill Address'}
        </button>
      </div>
      
      {/* Map */}
      <div className="border rounded-lg overflow-hidden">
        <div 
          ref={mapContainerRef}
          style={{ height: 300, width: '100%' }}
        />
      </div>
    </div>
  );
};

export default AddressMapPicker; 