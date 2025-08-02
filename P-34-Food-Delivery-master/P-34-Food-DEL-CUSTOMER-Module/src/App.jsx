import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import LoadingSpinner from './components/LoadingSpinner';

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          !user ? <LoginPage /> : <Navigate to="/" />
        } />
        <Route path="/register" element={
          !user ? <RegisterPage /> : <Navigate to="/" />
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          user ? (
            <>
              <Navbar />
              <HomePage />
            </>
          ) : <Navigate to="/login" />
        } />
        <Route path="/category/:categoryId" element={
          user ? (
            <>
              <Navbar />
              <CategoryPage />
            </>
          ) : <Navigate to="/login" />
        } />
        <Route path="/restaurant/:id" element={
          user ? (
            <>
              <Navbar />
              <RestaurantPage />
            </>
          ) : <Navigate to="/login" />
        } />
        <Route path="/cart" element={
          user ? (
            <>
              <Navbar />
              <CartPage />
            </>
          ) : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          user ? (
            <>
              <Navbar />
              <ProfilePage />
            </>
          ) : <Navigate to="/login" />
        } />
        <Route path="/orders" element={
          user ? (
            <>
              <Navbar />
              <OrdersPage />
            </>
          ) : <Navigate to="/login" />
        } />
      </Routes>
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RestaurantProvider>
          <Router>
            <AppRoutes />
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </RestaurantProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;