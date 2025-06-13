import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Package, Plus, MapPin, Clock } from 'lucide-react';

// interface Order {
//   id: string;
//   customerId: string;
//   pickupAddress: string;
//   dropAddress: string;
//   itemDescription: string;
//   status: 'pending' | 'assigned' | 'picked-up' | 'delivered';
//   deliveryPersonId?: string;
//   timestamp: string;
// }

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropAddress: '',
    itemDescription: ''
  });

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('deliveryflow_orders') || '[]');
    const userOrders = allOrders.filter((order) => order.customerId === user?.id);
    setOrders(userOrders);
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!formData.pickupAddress || !formData.dropAddress || !formData.itemDescription) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newOrder= {
      id: Date.now().toString(),
      customerId: user?.id,
      pickupAddress: formData.pickupAddress,
      dropAddress: formData.dropAddress,
      itemDescription: formData.itemDescription,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const allOrders = JSON.parse(localStorage.getItem('deliveryflow_orders') || '[]');
    allOrders.push(newOrder);
    localStorage.setItem('deliveryflow_orders', JSON.stringify(allOrders));

    setOrders([newOrder, ...orders]);
    setFormData({ pickupAddress: '', dropAddress: '', itemDescription: '' });
    setShowOrderForm(false);

    toast.success("Your delivery request has been submitted successfully.");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'picked-up':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your delivery orders and track their progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => ['assigned', 'picked-up'].includes(o.status)).length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* New Order Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="flex items-center py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Place New Order
          </button>
        </div>

        {/* Order Form */}
        {showOrderForm && (
          <div className="bg-white shadow-lg rounded-lg mb-8 animate-fade-in">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Create New Delivery Order</h3>
              <p className="text-sm text-gray-600">
                Fill in the details for your delivery request
              </p>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700">Pickup Address</label>
                    <textarea
                      id="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                      placeholder="Enter pickup address"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dropAddress" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                    <textarea
                      id="dropAddress"
                      value={formData.dropAddress}
                      onChange={(e) => setFormData({...formData, dropAddress: e.target.value})}
                      placeholder="Enter delivery address"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700">Item Description</label>
                  <textarea
                    id="itemDescription"
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({...formData, itemDescription: e.target.value})}
                    placeholder="Describe the item(s) to be delivered"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-md"
                  >
                    Place Order
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Your Orders</h3>
            <p className="text-sm text-gray-600">
              Track the status of all your delivery orders
            </p>
          </div>
          <div className="px-6 py-4">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No orders yet</p>
                <button 
                  onClick={() => setShowOrderForm(true)} 
                  className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Place Your First Order
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.timestamp).toLocaleDateString()} at{' '}
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Pickup:</p>
                        <p className="text-gray-600">{order.pickupAddress}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Delivery:</p>
                        <p className="text-gray-600">{order.dropAddress}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Item:</p>
                        <p className="text-gray-600">{order.itemDescription}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;