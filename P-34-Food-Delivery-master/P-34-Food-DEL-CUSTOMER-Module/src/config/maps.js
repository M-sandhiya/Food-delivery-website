// Google Maps Configuration
// Using environment variable for API key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// To get a Google Maps API key:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable the following APIs:
//    - Maps JavaScript API
//    - Geocoding API
// 4. Create credentials (API key)
// 5. Add your API key to the .env file as VITE_GOOGLE_MAPS_API_KEY
// 6. Optionally restrict the API key to your domain for security

export const MAPS_CONFIG = {
  defaultCenter: { lat: 20.5937, lng: 78.9629 }, // India
  defaultZoom: 4,
  streetZoom: 15,
  mapId: 'YOUR_GOOGLE_MAPS_MAP_ID', // <-- Add your Google Maps Map ID here
  mapOptions: {
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: true,
    zoomControl: true,
  }
}; 