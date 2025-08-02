import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, Car, Camera } from 'lucide-react';

const ProfileForm = ({ partner, onUpdate, isUpdating }) => {
  const [formData, setFormData] = useState({
    name: partner?.name || partner?.username || '',
    phone: partner?.phone || '',
    profilePic: partner?.profilePic || ''
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(partner?.profilePic || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData({
      name: partner?.name || partner?.username || '',
      phone: partner?.phone || '',
      profilePic: partner?.profilePic || ''
    });
    setPreviewUrl(partner?.profilePic || '');
    setProfilePicFile(null);
  }, [partner]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map name to username for backend compatibility
    const updatePayload = {
      ...formData,
      username: formData.name,
    };
    delete updatePayload.name;
    onUpdate(updatePayload, profilePicFile);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePicClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <img
            src={previewUrl || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            onClick={handleProfilePicClick}
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Vehicle Type field removed */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={partner?.email || ''}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isUpdating}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdating ? 'Updating Profile...' : 'Update Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;