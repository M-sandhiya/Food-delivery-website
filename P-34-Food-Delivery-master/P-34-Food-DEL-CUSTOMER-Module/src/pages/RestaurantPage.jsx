import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRestaurant } from '../context/RestaurantContext';
import { getRestaurantById, getRestaurantByIdWithCategory, getCustomerRestaurantDetails } from '../services/restaurantApi';
import { getCategoryById } from '../services/categoryApi';
import { useCart } from '../context/CartContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Star, Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import imgNotFound from '../assets/img_not_found.jpg';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { restaurant } = useRestaurant();
  const categoryId = searchParams.get('category');
  const { addToCart, cartItems = [], updateQuantity, removeFromCart } = useCart();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [dishesByCuisine, setDishesByCuisine] = useState({});
  
  useEffect(() => {
    loadDishes();
  }, [id, categoryId]);

  // Remove restaurantLoading and related useEffect
  
  const loadDishes = async () => {
    setLoading(true);
    try {
      if (categoryId) {
        const categoryData = await getCategoryById(categoryId);
        setCategory(categoryData);
      }
      // Fetch dishes grouped by cuisine from customer endpoint
      const dishesData = await getCustomerRestaurantDetails(id);
      setDishesByCuisine(dishesData);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = async (dish) => {
    setAddingToCart(dish.id);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addToCart(dish, restaurant.id, restaurant.restaurantName, restaurant.resturantPic);
    setAddingToCart(null);
  };
  
  const getDishTypeIcon = (type) => {
    if (type === 'veg') {
      return <div className="w-4 h-4 border-2 border-green-500 flex items-center justify-center">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>;
    } else {
      return <div className="w-4 h-4 border-2 border-red-500 flex items-center justify-center">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      </div>;
    }
  };
  
  const handleBackClick = () => {
    if (categoryId) {
      navigate(`/category/${categoryId}`);
    } else {
      navigate('/');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant details not found.</h2>
          <Button onClick={handleBackClick}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate distance and delivery time if lat/lon are available
  let distance = '';
  let deliveryTime = '';
  // Use user's location from HomePage if available (optionally pass as prop or context)
  // For now, fallback to 0,0 if not available
  const userLat = Number(localStorage.getItem('userLat')) || 0;
  const userLon = Number(localStorage.getItem('userLon')) || 0;
  if (restaurant.lat && restaurant.lon && userLat && userLon) {
    const dist = calculateDistance(userLat, userLon, Number(restaurant.lat), Number(restaurant.lon));
    distance = dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(2) + ' km';
    deliveryTime = estimateDeliveryTime(dist);
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative">
        <img
          src={restaurant.resturantPic || '/default_restaurant.png'}
          alt={restaurant.restaurantName}
          className="w-full h-64 md:h-80 object-cover"
          onError={e => {
            if (!e.target.src.includes('/default_restaurant.png')) {
              e.target.onerror = null;
              e.target.src = '/default_restaurant.png';
            }
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute top-4 left-4">
          <Button
            variant="secondary"
            onClick={handleBackClick}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">{restaurant.restaurantName}</h1>
              {category && (
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {category.name}
                </span>
              )}
            </div>
            <p className="text-lg mb-4">{restaurant.description}</p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">{restaurant.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? `${category.name} Menu` : 'Menu'}
          </h2>
          {/* No count here, as grouped by cuisine */}
        </div>
        {Object.keys(dishesByCuisine).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {category ? `No ${category.name} items available at this restaurant` : 'No menu items available'}
            </p>
          </div>
        ) : (
          Object.entries(dishesByCuisine).map(([cuisine, dishes]) => (
            <div key={cuisine} className="mb-8">
              <h3 className="font-bold text-lg mt-4 mb-2">{cuisine}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dishes.map((dish) => {
                  // Simple veg/non-veg icon logic (customize as needed)
                  const isVeg = /paneer|veg|dal|aloo|gobi|palak|chana|mushroom|mix/i.test(dish.name) || /veg/i.test(dish.category);
                  // Find quantity in cart
                  const cartItem = cartItems.find(item => item.id === dish.id);
                  const quantity = cartItem ? cartItem.quantity : 0;
                  return (
                    <Card key={dish.id} className="overflow-hidden border rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 bg-white flex flex-col justify-between h-full">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={dish.image}
                    alt={dish.name}
                          className="w-full h-48 object-cover rounded-t-xl"
                          onError={e => {
                            if (!e.target.src.includes('img_not_found.jpg')) {
                              e.target.onerror = null;
                              e.target.src = imgNotFound;
                            }
                          }}
                  />
                </div>
                      <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
                          <div className={`w-4 h-4 border-2 flex items-center justify-center rounded ${isVeg ? 'border-green-500' : 'border-red-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{dish.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <span className="mr-2">{dish.category}</span>
                          <span>|</span>
                          <span className="ml-2">{dish.cusine}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{dish.price}
                    </span>
                  </div>
                        <div className="mt-auto">
                          {quantity > 0 ? (
                            <div className="flex items-center justify-center gap-3 bg-gray-100 rounded-full py-2 px-4 shadow-inner transition-all">
                              <button
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-xl font-bold hover:bg-gray-300 transition"
                                onClick={() => quantity === 1 ? removeFromCart(dish.id) : updateQuantity(dish.id, quantity - 1)}
                                aria-label={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                              >
                                {quantity === 1 ? <Trash2 className="h-5 w-5 text-red-500" /> : '-' }
                              </button>
                              <span className="text-lg font-semibold w-8 text-center select-none">{quantity}</span>
                              <button
                                className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-full text-xl font-bold hover:bg-orange-600 transition"
                                onClick={() => updateQuantity(dish.id, quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                  <Button
                              onClick={() => addToCart(dish, restaurant.id, restaurant.restaurantName, restaurant.resturantPic)}
                              className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full py-2"
                  >
                    <span>Add to Cart</span>
                  </Button>
                          )}
                        </div>
                </div>
              </Card>
                  );
                })}
              </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantPage;