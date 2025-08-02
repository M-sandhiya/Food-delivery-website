import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCategories } from '../services/categoryApi';
// TODO: Move searchRestaurants to restaurantApi.js if not already
import { searchRestaurants, getRestaurantsByLocation } from '../services/restaurantApi';
import { getUserAddresses } from '../services/customerApi';
import Card from '../components/Card';
import CategoryCard from '../components/CategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, MapPin, Star, Clock, ChevronRight, Crosshair } from 'lucide-react';
import { getCurrentLocation, reverseGeocode } from '../components/AddressMapPicker';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import { useRestaurant } from '../context/RestaurantContext';

function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps && window.google.maps.places) return Promise.resolve();
  if (document.getElementById('google-maps-script')) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Helper to calculate distance between two lat/lon points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper to estimate delivery time based on distance (simple logic)
function estimateDeliveryTime(distanceKm) {
  if (!distanceKm) return '';
  if (distanceKm < 2) return '20-30 min';
  if (distanceKm < 5) return '30-40 min';
  if (distanceKm < 10) return '40-55 min';
  return '55+ min';
}

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('BTM Layout, Bangalore');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [locating, setLocating] = useState(false);
  const RADIUS_KM = 10; // static radius
  const navigate = useNavigate();
  const locationInputRef = useRef();
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const { setRestaurant } = useRestaurant();
  
  useEffect(() => {
    // On mount, try to get user's default address
    const fetchDefaultAddress = async () => {
      try {
        const addresses = await getUserAddresses();
        if (Array.isArray(addresses) && addresses.length > 0) {
          // Try to get default address from localStorage
          const defaultAddressId = localStorage.getItem('defaultAddressId');
          let defaultAddr = addresses.find(addr => String(addr.id) === String(defaultAddressId));
          if (!defaultAddr) {
            defaultAddr = addresses[0];
          }
          if (defaultAddr && defaultAddr.latitude && defaultAddr.longitude) {
            setLat(defaultAddr.latitude);
            setLon(defaultAddr.longitude);
            // Show only the main area (not street/city) in the location field
            let area = '';
            if (defaultAddr.mainArea) {
              area = defaultAddr.mainArea;
              setLocation(area);
            } else {
              // Fallback: use reverse geocode to get main area
              try {
                const addressData = await reverseGeocode(defaultAddr.latitude, defaultAddr.longitude, GOOGLE_MAPS_API_KEY);
                setLocation(addressData.mainArea || '');
              } catch (err) {
                setLocation('');
              }
            }
          }
        }
      } catch (err) {
        // fallback: do nothing, user can use geolocation
      }
    };
    fetchDefaultAddress();
  }, []);
  
  // When lat/lon change, reload restaurants
  useEffect(() => {
    if (lat && lon) {
      loadData();
    }
    // eslint-disable-next-line
  }, [lat, lon]);
  
  const loadData = async () => {
    setLoading(true);
    setCategoriesLoading(true);
    try {
      // Fetch categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setCategoriesLoading(false);
    }

    try {
      // Use default or current lat/lon for initial load
      if (lat && lon) {
        const restaurantsData = await getRestaurantsByLocation(lat, lon, RADIUS_KM, searchQuery);
        setRestaurants(restaurantsData);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getRestaurantsByLocation(lat, lon, RADIUS_KM, searchQuery);
      setRestaurants(data);
    } catch (error) {
      console.error('Error searching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestaurantClick = (restaurant) => {
    setRestaurant(restaurant);
    navigate(`/restaurant/${restaurant.id}`);
  };
  
  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentLocation();
      setLat(coords.latitude);
      setLon(coords.longitude);
      try {
        const addressData = await reverseGeocode(coords.latitude, coords.longitude, GOOGLE_MAPS_API_KEY);
        setLocation(addressData.mainArea || '');
      } catch (err) {
        setLocation('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to get your location');
    } finally {
      setLocating(false);
    }
  };
  
  useEffect(() => {
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY).then(() => {
      if (locationInputRef.current && window.google) {
        const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ['geocode'],
          componentRestrictions: { country: 'in' },
        });
        autocomplete.addListener('place_changed', async () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const latVal = place.geometry.location.lat();
            const lonVal = place.geometry.location.lng();
            setLat(latVal);
            setLon(lonVal);
            try {
              const addressData = await reverseGeocode(latVal, lonVal, GOOGLE_MAPS_API_KEY);
              setLocation(addressData.mainArea || '');
            } catch (err) {
              setLocation('');
            }
          } else {
            setLocation('');
          }
        });
      }
    });
  }, []);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 1) {
      // Static suggestions for demo; replace with backend call for real data
      const staticSuggestions = ['Pizza', 'Burger', 'Pasta', 'Spicy Bite', 'Grill House', 'Taste Hub', 'Urban Flavor', 'BTM Cafe'];
      setSearchSuggestions(staticSuggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      ));
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const handleSearchSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    handleSearch();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Delicious Food, Delivered Fast
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover amazing restaurants and cuisines near you
            </p>
            
            {/* Search Form */}
            <form onSubmit={e => { e.preventDefault(); handleSearch(); }} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, cuisines, or dishes..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="w-full pl-10 pr-4 py-3 border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500"
                    onFocus={() => searchQuery && setShowSearchSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 100)}
                  />
                  {showSearchSuggestions && searchSuggestions.length > 0 && (
                    <ul className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {searchSuggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-2 hover:bg-orange-50 cursor-pointer"
                          onMouseDown={() => handleSearchSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm font-medium focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: 0 }}
                    tabIndex={-1}
                  >
                    <Crosshair className="h-5 w-5" />
                    {locating ? 'Locating...' : 'Use My Location'}
                  </button>
                </div>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        {categoriesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Restaurants Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Restaurants'}
          </h2>
          <p className="text-gray-600">
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No restaurants found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {restaurants.map((restaurant) => {
              // Calculate distance and delivery time if lat/lon are available
              let distance = '';
              let deliveryTime = '';
              if (lat && lon && restaurant.lat && restaurant.lon) {
                const dist = calculateDistance(Number(lat), Number(lon), Number(restaurant.lat), Number(restaurant.lon));
                if (dist < 1) {
                  distance = Math.round(dist * 1000) + ' m';
                } else {
                  distance = dist.toFixed(2) + ' km';
                }
                deliveryTime = estimateDeliveryTime(dist);
              }
              return (
              <Card
                key={restaurant.id}
                  className="flex flex-col h-full justify-between overflow-hidden"
                hover={true}
                  onClick={() => handleRestaurantClick(restaurant)}
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                      src={restaurant.resturantPic || '/default_restaurant.png'}
                      alt={restaurant.restaurantName}
                    className="w-full h-48 object-cover"
                      onError={e => {
                        if (!e.target.src.includes('/default_restaurant.png')) {
                          e.target.onerror = null;
                          e.target.src = '/default_restaurant.png';
                        }
                      }}
                  />
                </div>
                  <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {restaurant.restaurantName}
                  </h3>
                    <p className="text-gray-600 mb-3 flex-1">
                      {restaurant.description || 'No description available.'}
                  </p>
                    <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-700">
                            {restaurant.rating !== null && restaurant.rating !== undefined ? restaurant.rating : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">{deliveryTime}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{distance}</span>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;