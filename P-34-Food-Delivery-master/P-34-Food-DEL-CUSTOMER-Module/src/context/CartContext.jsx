import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Modal state for restaurant conflict
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [pendingDish, setPendingDish] = useState(null);
  const [pendingRestaurantId, setPendingRestaurantId] = useState(null);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (dish, restaurantId, restaurantName, restaurantImage) => {
    if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurantId) {
      setPendingDish({ ...dish, restaurantName, restaurantImage });
      setPendingRestaurantId(restaurantId);
      setShowRestaurantModal(true);
      return;
    }
    const existingItem = cartItems.find(item => item.id === dish.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === dish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([
        ...cartItems,
        { ...dish, quantity: 1, restaurantId, restaurantName, restaurantImage }
      ]);
    }
  };

  const confirmClearAndAdd = () => {
    setCartItems([{ ...pendingDish, quantity: 1, restaurantId: pendingRestaurantId }]);
    localStorage.setItem('cartItems', JSON.stringify([{ ...pendingDish, quantity: 1, restaurantId: pendingRestaurantId }]));
    setShowRestaurantModal(false);
    setPendingDish(null);
    setPendingRestaurantId(null);
  };
  const cancelClear = () => {
    setShowRestaurantModal(false);
    setPendingDish(null);
    setPendingRestaurantId(null);
  };

  const removeFromCart = (dishId) => {
    setCartItems(cartItems.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity === 0) {
      removeFromCart(dishId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === dishId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    selectedAddress,
    setSelectedAddress,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {showRestaurantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Clear Cart?</h2>
            <p className="mb-6 text-gray-700">
              Your cart contains items from a different restaurant.<br />
              Do you want to clear the cart and add this item?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-5 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 font-semibold"
                onClick={confirmClearAndAdd}
              >
                Yes, Clear Cart
              </button>
              <button
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 font-semibold"
                onClick={cancelClear}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};