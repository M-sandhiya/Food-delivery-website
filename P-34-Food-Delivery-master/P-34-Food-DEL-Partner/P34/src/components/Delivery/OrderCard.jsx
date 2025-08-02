import React from 'react';
import { MapPin, Clock, Utensils } from 'lucide-react';

const OrderCard = ({ order, onAccept, isAccepting }) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-emerald-50 rounded-2xl p-0 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[380px] overflow-hidden">
      {/* Restaurant Image */}
      {order.restaurant.img && (
        <img
          src={order.restaurant.img}
          alt={order.restaurant.name}
          className="w-full h-32 object-cover rounded-t-2xl border-b border-gray-200"
        />
      )}
      <div className="flex justify-between items-start mb-4 gap-4 px-6 pt-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center truncate">
            <Utensils className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
            <span className="truncate">{order.restaurant.name}</span>
          </h3>
          <p className="text-sm text-gray-600 flex items-center mb-1 truncate">
            <MapPin className="w-4 h-4 mr-1 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{order.restaurant.address}</span>
          </p>
        </div>
        <div className="text-right flex flex-col items-end flex-shrink-0">
          <p className="text-2xl font-extrabold text-emerald-600 leading-none">₹{order.amount}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>{order.status}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100 flex-1 flex flex-col mx-4">
        <p className="text-sm text-gray-800 font-semibold mb-2">Dishes:</p>
        <ul className="text-sm text-gray-700 mb-2 list-disc list-inside flex-1">
          {order.dishes.map((dish) => (
            <li key={dish.dishId} className="mb-1 flex justify-between">
              <span className="font-medium truncate">{dish.name}</span>
              <span className="text-gray-500 ml-2">x {dish.quantity}</span>
            </li>
          ))}
        </ul>
        {order.instructions && order.instructions.trim() !== '' && (
          <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mt-2">
            <strong>Instructions:</strong> {order.instructions}
          </p>
        )}
        <div className="flex flex-wrap items-center text-xs text-gray-500 mt-3 gap-2">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Created: {new Date(order.createdAt).toLocaleString()}
          </span>
          {order.paymentType && (
            <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
              {order.paymentType.toUpperCase()}
            </span>
          )}
          {order.paymentStatus && (
            <span className="ml-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold">
              {order.paymentStatus}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-auto pt-2 px-4 pb-4">
        {/* Rider Assignment Status */}
        <div className="mb-2 text-xs font-semibold text-gray-700 text-center">
          {order.riderAssigned ? 'Rider assigned' : 'Rider not assigned'}
        </div>
        <button
          onClick={() => onAccept(order)}
          disabled={isAccepting}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isAccepting ? 'Accepting...' : 'Accept Order'}
        </button>
      </div>
    </div>
  );
};

export default OrderCard;