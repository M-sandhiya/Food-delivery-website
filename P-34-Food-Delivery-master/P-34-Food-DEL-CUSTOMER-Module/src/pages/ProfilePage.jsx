import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { updateCustomerDetails, addAddress, editAddress, deleteAddress, getUserAddresses, setDefaultAddress } from '../services/customerApi';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import defaultProfile from '../assets/default_profile.png';
import AddressMapPicker from '../components/AddressMapPicker';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  // New state for profile image
  const [profileImg, setProfileImg] = useState(null);
  const [profileImgPreview, setProfileImgPreview] = useState('');
  
  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setProfileImgPreview(user.profilePic || user.profile_pic || defaultProfile);
    }
  }, [user]);
  
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: 'BTM layout,16th Main Road',
      city: 'Bengaluru',
      zipCode: '590001',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      address: 'Anna Nagar, Guindy',
      city: 'Chennai',
      zipCode: '6000028',
      isDefault: false
    }
  ]);
  // Modal state for address add/edit
  const [showAddressModal, setShowAddressModal] = useState(false);
  // Address form state
  const [addressForm, setAddressForm] = useState({
    id: null,
    addressName: '',
    street: '', // street name only
    fullAddress: '', // complete formatted address
    city: '',
    state: '',
    zipCode: '', // pincode
    country: '',
    latitude: '',
    longitude: '',
    landmark: '', // landmark
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Open modal for add
  const handleAddAddressClick = () => {
    setAddressForm({ 
      id: null, 
      addressName: '', 
      street: '', // street name only
      fullAddress: '', // complete formatted address
      city: '', 
      state: '', 
      zipCode: '', 
      country: '', 
      latitude: '', 
      longitude: '', 
      landmark: '' 
    });
    setIsEditingAddress(false);
    setShowAddressModal(true);
  };
  // Open modal for edit
  const handleEditAddressClick = (address) => {
    setAddressForm({
      id: address.id,
      addressName: address.addressName || '',
      street: address.street || address.address || '',
      fullAddress: address.fullAddress || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.pincode || address.zipCode || '',
      country: address.country || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      landmark: address.landmark || '',
    });
    setIsEditingAddress(true);
    setShowAddressModal(true);
  };
  // Handle address form change
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  // Save address (add or edit)
  const handleAddressFormSave = async () => {
    try {
      const addressPayload = {
        ...addressForm,
        defaultAddress: !!addressForm.defaultAddress // always boolean
      };
      if (isEditingAddress) {
        await editAddress(addressPayload);
      } else {
        await addAddress(addressPayload);
      }
      // Always fetch the latest addresses from backend
      const freshAddresses = await getUserAddresses();
      const addressesWithFullAddress = freshAddresses.map(addr => ({
        ...addr,
        fullAddress: addr.fullAddress || addr.address || [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ')
      }));
      setAddresses(addressesWithFullAddress);
      setShowAddressModal(false);
      toast.success('Address saved successfully!');
    } catch (err) {
      toast.error('Failed to save address');
    }
  };
  // Show delete confirmation
  const handleDeleteClick = (address) => {
    setAddressToDelete(address);
    setShowDeleteConfirm(true);
  };

  // Delete address
  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    
    try {
      await deleteAddress(addressToDelete);
      // Always fetch the latest addresses from backend
      const freshAddresses = await getUserAddresses();
      const addressesWithFullAddress = freshAddresses.map(addr => ({
        ...addr,
        fullAddress: addr.fullAddress || addr.address || [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ')
      }));
      setAddresses(addressesWithFullAddress);
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
      toast.success('Address deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setAddressToDelete(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile image change
  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB. Please choose a smaller image.');
        return;
      }
      
      setProfileImg(file);
      setProfileImgPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = await updateCustomerDetails(formData, profileImg);
      updateProfile(updatedData);
      // Update preview to new image from backend if available (support both property names)
      if (updatedData.profilePic || updatedData.profile_pic) {
        setProfileImgPreview(updatedData.profilePic || updatedData.profile_pic);
      }
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || user?.firstName || '',
      last_name: user?.last_name || user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setProfileImg(null);
    setProfileImgPreview(user?.profilePic || user?.profile_pic || defaultProfile);
    setIsEditing(false);
  };
  
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
  
  useEffect(() => {
    getUserAddresses()
      .then((data) => {
        if (Array.isArray(data)) {
          // Ensure fullAddress is set for each address
          const addressesWithFullAddress = data.map(addr => ({
            ...addr,
            fullAddress: addr.fullAddress || addr.address || [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ')
          }));
          setAddresses(addressesWithFullAddress);
        } else {
          setAddresses([]); // fallback if backend returns non-array
        }
      })
      .catch((err) => {
        setAddresses([]); // fallback on error
        console.error('Failed to fetch addresses:', err);
      });
  }, [user]);

  // Update handleSetDefault to always send defaultAddress as boolean for all addresses
  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      // Re-fetch addresses to update UI
      const freshAddresses = await getUserAddresses();
      const addressesWithFullAddress = freshAddresses.map(addr => ({
        ...addr,
        fullAddress: addr.fullAddress || addr.address || [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ')
      }));
      setAddresses(addressesWithFullAddress);
      toast.success('Default address set successfully!');
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Profile Info */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="success"
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCancel}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <img
                      src={profileImgPreview}
                      alt={getDisplayName()}
                      className="w-20 h-20 rounded-full object-cover bg-gray-200"
                      onError={(e) => {
                        e.target.src = defaultProfile;
                      }}
                    />
                    {/* Edit overlay */}
                    {isEditing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImgChange}
                        />
                        <Edit2 className="h-6 w-6 text-white opacity-80 group-hover:opacity-100" />
                      </label>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{getDisplayName()}</h3>
                    <p className="text-gray-600">{user?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                    <Input
                      name="first_name"
                      type="text"
                      label="First Name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                    <Input
                      name="last_name"
                      type="text"
                      label="Last Name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                    <Input
                      name="phone"
                      type="tel"
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
          

        </div>
        
        {/* Saved Addresses */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
            <Button variant="outline" onClick={handleAddAddressClick}>Add New Address</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(addresses) && addresses.map((address) => (
              <div
                key={address.id}
                className={`relative p-4 border rounded-xl shadow-sm transition-all duration-200 bg-white hover:shadow-lg flex flex-col justify-between h-full ${address.defaultAddress ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}`}
                style={{ minHeight: '160px' }}
              >
                {/* Top-right: Default badge or Set as Default button */}
                <div className="absolute top-2 right-2 flex flex-col items-end space-y-2 z-10">
                  {address.defaultAddress ? (
                    <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full shadow-md">
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded-full shadow hover:bg-orange-100 transition"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
                  <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                      <p className="font-bold text-gray-900 text-lg">
                          {address.addressName || address.type}
                        </p>
                      </div>
                      {address.landmark && (
                        <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Landmark:</span> {address.landmark}
                        </p>
                      )}
                    <p className="text-sm text-gray-700 mt-1">
                        {address.street}, {address.city} {address.zipCode}
                      </p>
                      {address.state && (
                        <p className="text-sm text-gray-600">
                          {address.state}
                        </p>
                      )}
                    </div>
                  </div>
                {/* Bottom-right: Edit/Delete buttons */}
                <div className="absolute bottom-2 right-2 flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditAddressClick(address)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(address)}>
                      <X className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
         {/* Address Modal */}
         {showAddressModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 animate-fadeIn">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
               {/* Sticky Header with Cancel (X) mark */}
               <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center gap-2 px-6 py-4 shadow-sm">
                 <span className="inline-block bg-orange-100 text-orange-600 rounded-full p-2">
                   <MapPin className="h-5 w-5" />
                 </span>
                 <h3 className="text-lg font-semibold text-gray-900 flex-1">
                   {isEditingAddress ? 'Edit Address' : 'Add Address'}
                 </h3>
                 <button
                   className="text-gray-400 hover:text-red-500 transition-colors text-xl font-bold focus:outline-none ml-2 focus:ring-2 focus:ring-red-300 rounded-full"
                   onClick={() => setShowAddressModal(false)}
                   aria-label="Close"
                 >
                   <span aria-hidden="true">&times;</span>
                 </button>
               </div>
               {/* Form Content */}
               <div className="flex-1 px-6 py-4 space-y-4">
                 <Input label="Address Name" name="addressName" value={addressForm.addressName} onChange={handleAddressFormChange} />
                 <Input label="Street" name="street" value={addressForm.street} onChange={handleAddressFormChange} />
                 <Input label="Landmark" name="landmark" value={addressForm.landmark} onChange={handleAddressFormChange} />
                 <Input label="City" name="city" value={addressForm.city} onChange={handleAddressFormChange} />
                 <Input label="State" name="state" value={addressForm.state} onChange={handleAddressFormChange} />
                 <Input label="Pincode" name="zipCode" value={addressForm.zipCode} onChange={handleAddressFormChange} />
                 <Input label="Full Address" name="fullAddress" value={addressForm.fullAddress} onChange={handleAddressFormChange} />
                 {/* Map Picker Component */}
                 <AddressMapPicker
                   addressForm={addressForm}
                   setAddressForm={setAddressForm}
                   onAddressUpdate={(addressData) => {
                     console.log('Address auto-filled:', addressData);
                   }}
                 />
               </div>
               {/* Sticky Footer Buttons */}
               <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-2 shadow-sm">
                 <Button variant="secondary" onClick={() => setShowAddressModal(false)} className="focus:ring-2 focus:ring-orange-300">
                   Cancel
                 </Button>
                 <Button variant="success" onClick={handleAddressFormSave} className="focus:ring-2 focus:ring-green-300">
                   {isEditingAddress ? 'Save' : 'Add'}
                 </Button>
               </div>
             </div>
           </div>
         )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Address</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">Are you sure you want to delete this address?</p>
                {addressToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{addressToDelete.type}</p>
                    <p className="text-sm text-gray-600">{addressToDelete.fullAddress || addressToDelete.address}</p>
                    <p className="text-sm text-gray-600">
                      {addressToDelete.city}, {addressToDelete.state} {addressToDelete.zipCode}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={handleCancelDelete}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAddress}>
                  Delete Address
                </Button>
              </div>
            </div>
          </div>
        )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;