import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Home, Package } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path) => location.pathname === path;
  
  // Helper function to get display name
  const getDisplayName = () => {
    const firstName = user?.first_name || user?.firstName;
    const lastName = user?.last_name || user?.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (user?.username) {
      return user.username;
    } else {
      return 'User';
    }
  };
  
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 text-white p-2 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-800">FoodStack</span>
          </Link>
          
          {user && (
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/cart"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors relative ${
                  isActive('/cart') ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              
              <Link
                to="/orders"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/orders') ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Orders</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/profile') ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{getDisplayName()}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;