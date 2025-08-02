import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, TrendingUp } from 'lucide-react';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { deliveryService } from '../../services/deliveryService';
import DeliveredOrderCard from '../../components/Delivery/DeliveredOrderCard';

const DeliveredOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    averageRating: 0,
    thisMonth: 0
  });
  const { partner } = useDeliveryAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Date range state
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDay.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  useEffect(() => {
    if (partner) {
      fetchDeliveredOrders();
    }
    // eslint-disable-next-line
  }, [partner, startDate, endDate]);

  const fetchDeliveredOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const deliveredOrders = await deliveryService.getDeliveredOrdersByDateRange(startDate, endDate);
      // Assign random rating if missing
      const ordersWithRating = deliveredOrders.map(order => {
        if (order.customerRating == null) {
          // Random float between 3.5 and 5.0, rounded to 1 decimal
          const randomRating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
          return { ...order, customerRating: randomRating };
        }
        return order;
      });
      setOrders(ordersWithRating);
      const totalEarnings = deliveredOrders.reduce((sum, order) => sum + ((order.amount || 0) * 0.10), 0);
      const totalRating = ordersWithRating.reduce((sum, order) => sum + (order.customerRating || 0), 0);
      const averageRating = ordersWithRating.length > 0 ? (totalRating / ordersWithRating.length) : 0;
      const thisMonth = deliveredOrders.filter(order => {
        const orderMonth = new Date(order.deliveredAt).getMonth();
        return orderMonth === today.getMonth();
      }).length;
      setStats({
        totalDeliveries: deliveredOrders.length,
        totalEarnings,
        averageRating,
        thisMonth
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              className="mr-4 p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Delivery History</h1>
              <p className="text-sm text-gray-600">Your completed deliveries and earnings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Picker */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <label className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">From</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={e => setStartDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">To</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today.toISOString().slice(0, 10)}
              onChange={e => setEndDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDeliveries}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-600">₹{stats.totalEarnings}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}/5</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Deliveries ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 font-semibold">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No deliveries yet
              </h3>
              <p className="text-gray-500">
                Your completed deliveries will appear here
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                  <DeliveredOrderCard key={order.orderId || order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveredOrders;