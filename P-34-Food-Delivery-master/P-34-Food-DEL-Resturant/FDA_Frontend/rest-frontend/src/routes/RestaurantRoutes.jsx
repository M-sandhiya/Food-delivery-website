// src/routes/RestaurantRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { USER_ROLES } from '../constants/userRoles';

import Login from '../pages/Login';
import Register from '../pages/Register';

import RestaurantLayout from '../layouts/RestaurantLayout';
import Dashboard from '../pages/restaurant/Dashboard';
import ManageMenu from '../pages/restaurant/ManageMenu';
import Orders from '../pages/restaurant/Orders';
import Profile from '../pages/restaurant/Profile';
import Payout from '../pages/restaurant/Payout';
import Reviews from '../pages/restaurant/Reviews';

const RestaurantRoutes = () => (
  <Routes>
    {/* ✅ Public Routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* 🔐 Protected Restaurant Routes */}
    <Route
      path="/restaurant"
      element={
        <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
          <RestaurantLayout />
        </ProtectedRoute>
      }
    >
      {/* Default to dashboard */}
      <Route index element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="menu" element={<ManageMenu />} />
      <Route path="orders" element={<Orders />} />
      <Route path="profile" element={<Profile />} />
      <Route path="payout" element={<Payout />} />
      <Route path="reviews" element={<Reviews />} />
    </Route>

    {/* 🔁 Redirect root to dashboard (optional fallback) */}
    <Route path="/" element={<Navigate to="/restaurant/dashboard" />} />

    {/* 🚫 Catch-all 404 Page */}
    <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "2rem" }}>404 - Page Not Found</h2>} />
  </Routes>
);

export default RestaurantRoutes;
