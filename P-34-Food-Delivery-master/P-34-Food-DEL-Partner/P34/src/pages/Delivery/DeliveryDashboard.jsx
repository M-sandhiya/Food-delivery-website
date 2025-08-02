import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Package, LogOut, User, History } from 'lucide-react';
import { useDeliveryAuth } from '../../context/DeliveryAuthContext';
import { deliveryService } from '../../services/deliveryService';
import OrderCard from '../../components/Delivery/OrderCard';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isAccepting, setIsAccepting] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const { partner, logout, loading } = useDeliveryAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableOrders();
    // eslint-disable-next-line
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      const availableOrders = await deliveryService.getAvailableOrders();
      setOrders(availableOrders);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleAcceptOrder = async (order) => {
    setIsAccepting(true);
    try {
      const result = await deliveryService.acceptOrder(order.id);
      alert(result.message);
      if (result.success) {
        navigate(`/delivery/order/${order.id}`); // Redirect to order details page
      }
    } catch (err) {
      alert('Failed to accept order. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleFetchNearbyOrders = async () => {
    setLoadingNearby(true);
    try {
      const orders = await deliveryService.getAvailableOrdersNearby();
      setOrders(orders);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/delivery/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4 sm:gap-0">
            {/* Left: Avatar + Welcome */}
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold uppercase shadow">
                {partner?.profilePic ? (
                  <img src={partner.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  (partner?.username?.[0] || partner?.name?.[0] || 'D')
                )}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Welcome, <span className="uppercase">{partner?.username || partner?.name || 'Delivery Partner'}</span>!
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Ready to deliver some amazing food?
                </p>
              </div>
            </div>
            {/* Right: Icon Buttons (desktop only) */}
            <div className="hidden sm:flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => navigate('/delivery/profile')}
                className="p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Profile"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate('/delivery/history')}
                className="p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="History"
              >
                <History className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3 sm:gap-0 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800">
            Available Orders ({orders.length})
          </h2>
          <button
            onClick={handleFetchNearbyOrders}
            disabled={loadingNearby}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 mt-2 sm:mt-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingNearby ? 'animate-spin' : ''}`} />
            {loadingNearby ? 'Fetching Nearby Orders...' : 'Get Nearby Orders'}
          </button>
        </div>

        {loading && !orders.length ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No orders available right now
            </h3>
            <p className="text-gray-500 mb-4">
              Check back in a few minutes for new delivery opportunities
            </p>
            <button
              onClick={fetchAvailableOrders}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Refresh Orders
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                isAccepting={isAccepting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex sm:hidden justify-around items-center py-2 z-50 shadow-lg">
        <button
          onClick={() => navigate('/delivery/profile')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="Profile"
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">Profile</span>
        </button>
        <button
          onClick={() => navigate('/delivery/history')}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="History"
        >
          <History className="w-6 h-6 mb-1" />
          <span className="text-xs">History</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-xs">Exit</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryDashboard;