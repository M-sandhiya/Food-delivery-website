import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../services/orderApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, Clock, CheckCircle, XCircle, Calendar, CreditCard, Smartphone } from 'lucide-react';
import imgNotFound from '../assets/img_not_found.jpg';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeliveredOnly, setShowDeliveredOnly] = useState(false);
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    try {
      const data = await getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
      case 'ON_THE_WAY':
      case 'CREATED':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusText = (status) => {
    if (!status) return 'Pending';
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      case 'REJECTED':
        return 'Rejected';
      case 'CREATED':
        return 'Order Placed';
      case 'PREPARING':
        return 'Preparing';
      case 'READY_FOR_PICKUP':
        return 'Ready for Pickup';
      case 'ON_THE_WAY':
        return 'On the Way';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };
  
  const getStatusColor = (status) => {
    if (!status) return 'text-yellow-700 bg-yellow-100';
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'text-green-700 bg-green-100';
      case 'CANCELLED':
      case 'REJECTED':
        return 'text-red-700 bg-red-100';
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
      case 'ON_THE_WAY':
        return 'text-orange-700 bg-orange-100';
      case 'CREATED':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };
  
  const getPaymentStatusColor = (status) => {
    if (!status) return 'text-gray-700 bg-gray-100';
    switch (status.toLowerCase()) {
      case 'success':
      case 'paid':
        return 'text-green-700 bg-green-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      case 'refunded':
        return 'text-blue-700 bg-blue-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };
  
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'UPI':
        return <Smartphone className="h-4 w-4" />;
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  const ACTIVE_STATUSES = ['CREATED', 'PREPARING', 'READY_FOR_PICKUP', 'ON_THE_WAY'];
  const COMPLETED_STATUSES = ['DELIVERED', 'CANCELLED', 'REJECTED'];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded font-semibold border transition-colors ${showDeliveredOnly ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-600 border-orange-500 hover:bg-orange-50'}`}
            onClick={() => setShowDeliveredOnly(!showDeliveredOnly)}
          >
            {showDeliveredOnly ? 'Show Active Orders' : 'Show Completed Orders'}
          </button>
        </div>
        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600">When you place your first order, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(showDeliveredOnly
              ? orders.filter(entry => COMPLETED_STATUSES.includes(entry.order?.status))
              : orders.filter(entry => ACTIVE_STATUSES.includes(entry.order?.status))
            ).map((entry, idx) => {
              const order = entry.order;
              const restaurant = entry.restaurantDetails?.rdto;
              if (!order) return null;
              return (
                <Card key={order.id || idx} className="p-0 overflow-hidden shadow-lg border border-gray-200">
                  {/* Restaurant Banner */}
                  {restaurant && (
                    <div className="flex items-center bg-gradient-to-r from-orange-100 to-orange-50 p-4 border-b border-orange-200">
                      <img src={restaurant.restaurantPic} alt={restaurant.restaurantName} className="w-14 h-14 object-cover rounded-lg mr-4 border-2 border-orange-300" />
                  <div>
                        <h4 className="text-lg font-bold text-orange-800 mb-1">{restaurant.restaurantName}</h4>
                        <div className="text-xs text-gray-600">{restaurant.description}</div>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">Order #</span>
                        <span className="font-bold text-gray-900">{order.id}</span>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                {/* Payment Details */}
                    {order.transaction && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                            {getPaymentMethodIcon(order.transaction.typeOfPay)}
                      <div>
                              <p className="text-sm font-medium text-gray-900">{order.transaction.typeOfPay || 'N/A'}</p>
                        <p className="text-xs text-gray-600">Payment Method</p>
                      </div>
                    </div>
                    <div>
                            <p className="text-sm font-medium text-gray-900">{order.transaction.transactionId || 'N/A'}</p>
                      <p className="text-xs text-gray-600">Payment ID</p>
                    </div>
                    <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.transaction.status)}`}>{order.transaction.status}</span>
                      <p className="text-xs text-gray-600 mt-1">Payment Status</p>
                    </div>
                  </div>
                </div>
                    )}
                    {/* Rider Assigned Details */}
                    {order.riderAssigned && entry.rider ? (
                      <div className="relative bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-500 shadow-md flex items-center gap-4">
                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">Assigned Rider</div>
                        {entry.rider.profilePic ? (
                          <img src={entry.rider.profilePic} alt={entry.rider.username} className="w-14 h-14 object-cover rounded-full border-2 border-blue-300 shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 font-bold text-2xl border-2 border-blue-300 shadow-sm">
                            {entry.rider.username ? entry.rider.username.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-blue-900 text-lg mb-1 flex items-center gap-2">
                            <span>{entry.rider.username}</span>
                          </div>
                          <div className="flex items-center gap-4 text-blue-700 text-sm">
                            <a href={`tel:${entry.rider.phone}`} className="flex items-center gap-1 hover:text-blue-900 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.3 1.2a2 2 0 01-.45 1.95l-.7.7a16.001 16.001 0 006.36 6.36l.7-.7a2 2 0 011.95-.45l1.2.3A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z" /></svg>
                              <span>{entry.rider.phone}</span>
                            </a>
                            <a href={`mailto:${entry.rider.email}`} className="flex items-center gap-1 hover:text-blue-900 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4V4zm0 0l8 8 8-8" /></svg>
                              <span>{entry.rider.email}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100 text-blue-700">
                        Rider not yet assigned.
                      </div>
                    )}
                    <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Items Ordered:</h4>
                  <div className="space-y-2">
                    {/* Build a dishId -> dish object map for this order */}
                    {(() => {
                      const dishMap = {};
                      if (Array.isArray(entry.dishes)) {
                        entry.dishes.forEach(d => {
                          dishMap[d.dishId || d.id] = d;
                        });
                      }
                      if (Array.isArray(order.orderDishes) && order.orderDishes.length > 0) {
                        return order.orderDishes.map((od, index) => {
                          const dish = dishMap[od.dishId]; // Use dishId for mapping
                          const quantity = od.quantity || dish?.quantity || 1;
                          if (!dish) return null; // Defensive: skip if dish not found
                          const totalPrice = dish.price * quantity;
                          return (
                            <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-2 border border-gray-100">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={e => {
                                    if (!e.target.src.includes('img_not_found.jpg')) {
                                      e.target.onerror = null;
                                      e.target.src = imgNotFound;
                                    }
                                  }}
                                />
                                <div>
                                  <span className="text-gray-900 font-medium">{dish.name}</span>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span>{dish.category}</span>
                                    <span>•</span>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                      Qty: {quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-600 font-semibold">₹{dish.price} × {quantity}</span>
                                <div className="text-sm text-gray-500">₹{totalPrice}</div>
                              </div>
                            </div>
                          );
                        });
                      } else if (Array.isArray(entry.dishes) && entry.dishes.length > 0) {
                        return entry.dishes.map((item, index) => {
                          const quantity = item.quantity || 1;
                          const totalPrice = item.price * quantity;
                          return (
                            <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-2 border border-gray-100">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={e => {
                                    if (!e.target.src.includes('img_not_found.jpg')) {
                                      e.target.onerror = null;
                                      e.target.src = imgNotFound;
                                    }
                                  }}
                                />
                                <div>
                                  <span className="text-gray-900 font-medium">{item.name}</span>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span>{item.category}</span>
                                    <span>•</span>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                      Qty: {quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-600 font-semibold">₹{item.price} × {quantity}</span>
                                <div className="text-sm text-gray-500">₹{totalPrice}</div>
                        </div>
                      </div>
                          );
                        });
                      } else {
                        return <div className="text-gray-500 text-sm">No dishes found in this order.</div>;
                      }
                    })()}
                  </div>
                  {/* Delivery and GST note */}
                  <div className="mt-3 text-xs text-gray-500 italic">
                    Delivery Fee: ₹50 &nbsp; | &nbsp; GST: ₹25 &nbsp; <span className="font-semibold">(Total extra charges: ₹75)</span>
                  </div>
                </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm text-gray-600">
                      {order.status === 'DELIVERED' ? 'Order delivered successfully' :
                       order.status === 'CANCELLED' ? 'Order was cancelled' :
                       order.status === 'REJECTED' ? 'Order was rejected by the restaurant' :
                       order.status === 'CREATED' ? 'Order placed and awaiting confirmation' :
                       order.status === 'PREPARING' ? 'Order is being prepared' :
                       order.status === 'READY_FOR_PICKUP' ? 'Order is ready for pickup' :
                       order.status === 'ON_THE_WAY' ? 'Order is on the way' :
                       'Order status: ' + (order.status || 'Unknown')}
                    </span>
                  </div>
                  {order.status === 'DELIVERED' && (
                    <button className="text-orange-600 hover:text-orange-500 text-sm font-medium">
                      Reorder
                    </button>
                  )}
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">Total: ₹{order.amount}</span>
                      </div>
                    </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;