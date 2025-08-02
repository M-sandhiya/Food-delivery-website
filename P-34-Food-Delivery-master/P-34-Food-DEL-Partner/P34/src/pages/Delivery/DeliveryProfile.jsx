import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Car, Star, Package, Bike } from 'lucide-react';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { getDeliveryPartnerDetails, updateDeliveryPartnerDetails } from '../../services/deliveryPartnerApi';
import ProfileForm from '../../components/Delivery/ProfileForm';

const DeliveryProfile = () => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { partner, updateProfile } = useDeliveryAuth();
  const [profile, setProfile] = useState(partner);

  useEffect(() => {
    // Fetch latest profile from backend on mount
    getDeliveryPartnerDetails().then(data => {
      setProfile(data.r);
      updateProfile(data.r);
      if (data.token) localStorage.setItem('token', data.token);
    }).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const handleUpdateProfile = async (profileData, profilePic) => {
    setIsUpdating(true);
    try {
      const data = await updateDeliveryPartnerDetails(profileData, profilePic);
      setProfile(data.r);
      updateProfile(data.r);
      if (data.token) localStorage.setItem('token', data.token);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/delivery/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Profile Settings</h1>
              <p className="text-sm text-gray-600">Manage your delivery partner information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-center">
                <img
                  src={profile?.profilePic || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                />
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {profile?.name}
                </h2>
                <p className="text-gray-600 mb-2">{profile?.email}</p>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Bike className="w-4 h-4 mr-1" />
                  bike
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-gray-600">Total Deliveries</span>
                  </div>
                  <span className="font-semibold text-gray-800">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-gray-600">Average Rating</span>
                  </div>
                  <span className="font-semibold text-gray-800">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-gray-600">Member Since</span>
                  </div>
                  <span className="font-semibold text-gray-800">Dec 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Edit Profile Information
              </h3>
              <ProfileForm
                partner={profile}
                onUpdate={handleUpdateProfile}
                isUpdating={isUpdating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;