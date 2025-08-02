import React from 'react';
import { CheckCircle, Package, Truck } from 'lucide-react';

const DeliveryStatusButton = ({ currentStatus, onStatusUpdate, isUpdating }) => {
  const getNextStatus = (status) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'ON_THE_WAY';
      case 'ON_THE_WAY':
        return 'DELIVERED';
      case 'ACCEPTED':
        return 'ON_THE_WAY';
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'ACCEPTED':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'ON_THE_WAY':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'DELIVERED':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return <Package className="w-5 h-5" />;
      case 'ACCEPTED':
        return <Package className="w-5 h-5" />;
      case 'ON_THE_WAY':
        return <Truck className="w-5 h-5" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getButtonText = (status) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'Pick Up Order for Delivery';
      case 'ACCEPTED':
        return 'Mark as On The Way';
      case 'ON_THE_WAY':
        return 'Mark as Delivered';
      case 'DELIVERED':
        return 'Order Delivered';
      default:
        return 'Update Status';
    }
  };

  const nextStatus = getNextStatus(currentStatus);

  if (currentStatus === 'DELIVERED') {
    return (
      <div className={`flex items-center justify-center py-3 px-6 rounded-lg text-white ${getStatusColor(currentStatus)}`}>
        {getStatusIcon(currentStatus)}
        <span className="ml-2 font-medium">{getButtonText(currentStatus)}</span>
      </div>
    );
  }

  if (currentStatus === 'PREPARING') {
    return (
      <div className="flex items-center justify-center py-3 px-6 rounded-lg bg-gray-200 text-gray-700 font-medium">
        Order is preparing
      </div>
    );
  }

  return (
    <button
      onClick={() => onStatusUpdate(nextStatus)}
      disabled={isUpdating || !nextStatus}
      className={`flex items-center justify-center w-full py-3 px-6 rounded-lg text-white font-medium transition-colors duration-200 ${getStatusColor(currentStatus)} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {getStatusIcon(nextStatus)}
      <span className="ml-2">
        {isUpdating ? 'Updating...' : getButtonText(currentStatus)}
      </span>
    </button>
  );
};

export default DeliveryStatusButton;