import React from 'react';
import { Clock, Star, CreditCard, Banknote } from 'lucide-react';

const DeliveredOrderCard = ({ order }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {order.restaurantName}
          </h3>
          <p className="text-sm text-gray-600">
            Order #{order.id || order.orderId}
          </p>
          <p className="text-sm text-gray-600">
            Delivered to: {order.customerName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-emerald-600">
            ₹{order.amount ? (order.amount * 0.10).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-gray-500">Delivered Earning</p>
          <p className="text-sm text-gray-600 flex items-center justify-end">
            {order.paymentMethod === 'UPI' || order.paymentMethod === 'Card' ? (
              <CreditCard className="w-4 h-4 mr-1 text-emerald-500" />
            ) : (
              <Banknote className="w-4 h-4 mr-1 text-orange-500" />
            )}
            {order.paymentMethod}
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center text-sm mb-3">
          <span className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            Delivered in {order.deliveryTime}
          </span>
          {order.customerRating && (
            <span className="flex items-center text-gray-600">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              {order.customerRating}/5
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {formatDate(order.deliveredAt)}
        </p>
      </div>
    </div>
  );
};

export default DeliveredOrderCard;