# Google Maps Setup Guide

## Overview
This project now uses Google Maps instead of OpenStreetMap for better map functionality and geocoding services.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** - For displaying maps
   - **Geocoding API** - For reverse geocoding (address lookup)
   - **Places API** - For location search and autocomplete
4. Create credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy your API key

### 2. Configure the API Key

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Google Maps API key to the `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

**Important:** In Vite, environment variables must be prefixed with `VITE_` to be accessible in your React code.

### 3. Security (Recommended)

For production, restrict your API key:
1. In Google Cloud Console, go to your API key settings
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain(s): `localhost:5173/*` (for development)
4. Under "API restrictions", select "Restrict key"
5. Select only the APIs you need (Maps JavaScript API, Geocoding API)

### 4. Features Available

Once configured, you'll have access to:
- ✅ Interactive Google Maps
- ✅ Location search with Google Places autocomplete
- ✅ Click to set location
- ✅ Drag marker to adjust position
- ✅ "Use My Location" button (GPS)
- ✅ "Auto-fill Address" button (reverse geocoding)
- ✅ Auto-centering map on coordinate changes

### 5. Cost Information

- **Maps JavaScript API**: Free tier includes 28,500 map loads per month
- **Geocoding API**: Free tier includes 2,500 requests per month
- **Places API**: Free tier includes 1,000 requests per month
- For most small to medium applications, the free tier is sufficient

### 6. Troubleshooting

If you see a yellow warning box in the map component:
- Make sure you've added your API key to the `.env` file as `VITE_GOOGLE_MAPS_API_KEY`
- Check that both Maps JavaScript API and Geocoding API are enabled
- Verify your API key restrictions allow your domain

## Migration from OpenStreetMap

The following changes were made:
- ✅ Removed `react-leaflet` and `leaflet` dependencies
- ✅ Added `@googlemaps/js-api-loader` dependency
- ✅ Removed Leaflet CSS from `index.html`
- ✅ Updated `AddressMapPicker` component to use Google Maps
- ✅ Added configuration file for API key management
- ✅ Maintained all existing functionality (location detection, reverse geocoding, etc.) 