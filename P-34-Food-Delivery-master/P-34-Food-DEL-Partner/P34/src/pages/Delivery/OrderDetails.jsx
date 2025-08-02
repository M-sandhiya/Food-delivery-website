import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Clock, CreditCard, MessageSquare } from 'lucide-react';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { deliveryService } from '../../services/deliveryService';
import DeliveryStatusButton from '../../components/Delivery/DeliveryStatusButton';
import DeliveryMap from '../../components/Delivery/DeliveryMap';
import { useRiderLocation } from '../../context/RiderLocationContext';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { partner } = useDeliveryAuth();
  const riderLocation = useRiderLocation();

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const details = await deliveryService.getOrderDetails(orderId);
      setOrderDetails(details);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await deliveryService.updateOrderStatus(partner.id, orderId, newStatus);
      setOrderDetails(prev => ({ ...prev, status: newStatus }));
      if (newStatus === 'DELIVERED') {
        setTimeout(() => {
          navigate('/delivery/dashboard');
        }, 2000);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsUpdating(false);
    }
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
              <h1 className="text-xl font-semibold text-gray-800">
                Order #{orderDetails.orderId}
              </h1>
              <p className="text-sm text-gray-600">
                Status: <span className="font-medium">{orderDetails.status}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            {/* Restaurant Details */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-red-500 mr-2" />
                Restaurant Details
              </h3>
              <div className="space-y-3">
                {orderDetails.restaurant.img && (
                  <img
                    src={orderDetails.restaurant.img}
                    alt={orderDetails.restaurant.name}
                    className="w-full h-40 object-cover rounded-lg mb-2 border"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-800">{orderDetails.restaurant.name}</p>
                  <p className="text-sm text-gray-600">{orderDetails.restaurant.address}</p>
                </div>
                <a
                  href={`tel:${orderDetails.restaurant.phone}`}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {orderDetails.restaurant.phone}
                </a>
              </div>
            </div>

            {/* Dishes Details */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                Dishes
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {orderDetails.dishes.map((dish) => (
                  <div key={dish.dishId} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3 border">
                    <img
                      src={dish.img}
                      alt={dish.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{dish.name}</p>
                      <p className="text-sm text-gray-600">Qty: {dish.quantity}</p>
                      <p className="text-sm text-emerald-700 font-semibold">₹{dish.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-green-500 mr-2" />
                Customer Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-800">{orderDetails.customer.name}</p>
                  <p className="text-sm text-gray-600">{orderDetails.customer.address}</p>
                </div>
                <a
                  href={`tel:${orderDetails.customer.phone}`}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {orderDetails.customer.phone}
                </a>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                Order Info
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Time:</span>
                  <span className="font-medium text-gray-800">{
                    orderDetails.orderTime ?
                      new Date(orderDetails.orderTime).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                      }) : ''
                  }</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium text-gray-800 flex items-center">
                    <CreditCard className="w-4 h-4 mr-1" />
                    {orderDetails.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-medium text-gray-800">{orderDetails.paymentType?.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-800">₹{orderDetails.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Special Instructions:</span>
                  <span className="font-medium text-gray-800">{orderDetails.instructions || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Status Button */}
            <DeliveryStatusButton
              currentStatus={orderDetails.status}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={isUpdating}
            />

            {/* Message Customer */}
            <a
              href={`sms:${orderDetails.customer.phone}`}
              className="flex items-center justify-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Message Customer
            </a>
          </div>

          {/* Right Column - Map and Location */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-xl p-2 shadow-md">
              <DeliveryMap
                restaurant={orderDetails.restaurant}
                customer={orderDetails.customer}
                currentLocation={riderLocation}
                orderStatus={orderDetails.status}
              />
            </div>
            {/* Location Sharing removed */}
          </div>
        </div>
      </div>
      {/* Sticky Go to Restaurant/Customer Button */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 p-3 flex justify-center">
        <button
          className="w-full max-w-md bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg text-lg active:bg-blue-700 transition"
          onClick={() => {
            if (!riderLocation) {
              alert('Current location not available.');
              return;
            }
            let dest;
            if (orderDetails.status === 'PICKED_UP' || orderDetails.status === 'ON_THE_WAY') {
              dest = orderDetails.customer?.location;
            } else {
              dest = orderDetails.restaurant?.location;
            }
            if (!dest) {
              alert('Destination location not available.');
              return;
            }
            const { lat: originLat, lng: originLng } = riderLocation;
            const { lat: destLat, lng: destLng } = dest;
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
            window.open(mapsUrl, '_blank');
          }}
        >
          {orderDetails.status === 'PICKED_UP' || orderDetails.status === 'ON_THE_WAY' ? 'Go to Customer' : 'Go to Restaurant'}
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;