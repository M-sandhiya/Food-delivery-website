import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { getUserAddresses, setDefaultAddress } from '../services/customerApi';
// TODO: Move placeOrder to orderApi.js if not already
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../services/orderApi';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Minus, Trash2, MapPin, ShoppingBag } from 'lucide-react';
import imgNotFound from '../assets/img_not_found.jpg';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    selectedAddress,
    setSelectedAddress,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalAmount
  } = useCart();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [orderForPayment, setOrderForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const { restaurant } = useRestaurant();
  const { user } = useAuth();
  
  useEffect(() => {
    loadAddresses();
  }, []);
  
  const loadAddresses = async () => {
    try {
      const data = await getUserAddresses();
      setAddresses(data);
      // Set default address
      const defaultAddress = data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuantityChange = (dishId, newQuantity) => {
    updateQuantity(dishId, newQuantity);
  };
  
  const handleRemoveItem = (dishId) => {
    removeFromCart(dishId);
  };

  const handleSelectAddress = async (address) => {
    try {
      await setDefaultAddress(address.id);
      // Refresh addresses after setting default
      const freshAddresses = await getUserAddresses();
      setAddresses(freshAddresses);
      setShowAllAddresses(false);
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!defaultAddress) {
      toast.warning('Please select a delivery address');
      return;
    }
    setProcessingOrder(true);
    try {
      // Prepare CreateOrderDTO
      const dishIds = cartItems.map(item => item.id);
      const dishQuantities = {};
      cartItems.forEach(item => { dishQuantities[item.id] = item.quantity; });
      const amount = getTotalAmount() + 50 + 25; // subtotal + delivery fee + taxes
      const deliveryAddressId = defaultAddress.id;
      const restaurantId = cartItems[0]?.restaurantId;
      const orderData = {
        dishIds,
        amount,
        deliveryAddressId,
        restaurantId,
        dishQuantities
      };
      const result = await createOrder(orderData);
      if (result && result.id) {
        setOrderForPayment(result); // Save order for payment
        // Do not clear cart or redirect yet, wait for payment
        handleRazorpayPayment(result);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const handleRazorpayPayment = async (order) => {
    try {
      setPaymentLoading(true);
      const razorpayOrder = await createRazorpayOrder(order.amount * 100, order.id); // amount in paise
      const options = {
        key: RAZORPAY_KEY_ID, // Use env variable
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: restaurantName,
        description: 'Order Payment',
        image: restaurantImage,
        order_id: razorpayOrder.razorpayOrderId,
        handler: function (response) {
          setPaymentLoading(false);
          handleVerifyPayment(response, order.id);
        },
        prefill: {
          name: user?.first_name || user?.firstName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#F37254'
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
            toast.info('Payment cancelled. You can try again or contact support.');
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setPaymentLoading(false);
      console.error('Failed to initiate payment:', error);
      toast.error('Failed to initiate payment.');
    }
  };

  const handleVerifyPayment = async (response, orderId) => {
    try {
      await verifyRazorpayPayment({ ...response, orderId });
      clearCart();
      toast.success('Payment successful! Your order has been placed and is being prepared.');
      navigate('/orders', { replace: true });
      // Optionally, force reload to fetch latest orders
      window.location.reload();
    } catch (error) {
      toast.error('Payment verification failed. Please contact support.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
          <Button onClick={() => navigate('/')}>
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }
  
  const deliveryFee = 50;
  const taxes = 25;
  const subtotal = getTotalAmount();
  const total = subtotal + deliveryFee + taxes;
  
  // Find the default address from backend
  const defaultAddress = addresses.find(addr => addr.defaultAddress) || addresses[0];
  
  // Get restaurant details from the first cart item
  const restaurantName = cartItems[0]?.restaurantName || restaurant?.restaurantName || '';
  const restaurantImage = cartItems[0]?.restaurantImage || restaurant?.resturantPic || '/default_restaurant.png';
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        {/* Restaurant Details */}
        {cartItems.length > 0 && (
          <div className="flex items-center mb-6 p-4 bg-white rounded-xl shadow">
            <img src={restaurantImage} alt={restaurantName} className="w-20 h-20 object-cover rounded-lg mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{restaurantName}</h2>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={e => {
                      if (!e.target.src.includes('img_not_found.jpg')) {
                        e.target.onerror = null;
                        e.target.src = imgNotFound;
                      }
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
              <div className="space-y-3">
                {/* Show only the default address unless changing */}
                {!showAllAddresses && defaultAddress && (
                  <div className="p-3 rounded-lg border border-orange-500 bg-orange-50 flex justify-between items-start">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{defaultAddress.addressName || defaultAddress.type}</p>
                        <p className="text-sm text-gray-600">{defaultAddress.fullAddress || ''}</p>
                        {defaultAddress.street && <p className="text-sm text-gray-600">Street: {defaultAddress.street}</p>}
                        {defaultAddress.landmark && <p className="text-sm text-gray-600">Landmark: {defaultAddress.landmark}</p>}
                        <p className="text-sm text-gray-600">
                          {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}, {defaultAddress.country}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowAllAddresses(true)}>
                      Change Address
                    </Button>
                  </div>
                )}
                {/* Show all addresses for selection if changing */}
                {showAllAddresses && addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors mb-2 ${
                      defaultAddress?.id === address.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{address.addressName || address.type}</p>
                        <p className="text-sm text-gray-600">{address.fullAddress || ''}</p>
                        {address.street && <p className="text-sm text-gray-600">Street: {address.street}</p>}
                        {address.landmark && <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}, {address.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">₹{taxes}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{total}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handlePlaceOrder}
                loading={processingOrder}
                className="w-full mt-6"
                disabled={!defaultAddress}
              >
                Pay Now
              </Button>
            </Card>
          </div>
        </div>
      </div>
      {paymentLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Processing Payment...</h2>
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;