import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Package, Users, Clock, CheckCircle, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allOrders = JSON.parse(localStorage.getItem('deliveryflow_orders') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('deliveryflow_users') || '[]');
    
    setOrders(allOrders);
    setDeliveryPersonnel(allUsers.filter((u) => u.role === 'delivery'));
  };

  const assignOrder = (orderId, deliveryPersonId) => {
    const allOrders = JSON.parse(localStorage.getItem('deliveryflow_orders') || '[]');
    const updatedOrders = allOrders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: 'assigned', deliveryPersonId };
      }
      return order;
    });
    
    localStorage.setItem('deliveryflow_orders', JSON.stringify(updatedOrders));
    loadData();

    const deliveryPerson = deliveryPersonnel.find(dp => dp.id === deliveryPersonId);
    toast.success(`Order ${orderId} has been assigned to ${deliveryPerson?.name}.`);
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

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const assignedOrders = orders.filter(order => order.status === 'assigned');
  const inProgressOrders = orders.filter(order => order.status === 'picked-up');
  const deliveredOrders = orders.filter(order => order.status === 'delivered');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage orders, assign delivery personnel, and monitor system status.</p>
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
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {assignedOrders.length + inProgressOrders.length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{deliveredOrders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Delivery Personnel Card */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Delivery Personnel</h3>
            <p className="text-sm text-gray-600">
              Registered delivery personnel in the system
            </p>
          </div>
          <div className="px-6 py-4">
            {deliveryPersonnel.length === 0 ? (
              <p className="text-gray-500">No delivery personnel registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deliveryPersonnel.map((person) => (
                  <div key={person.id} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{person.name}</p>
                        <p className="text-sm text-gray-600">{person.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
            <p className="text-sm text-gray-600">
              Assign delivery personnel to pending orders and monitor all orders
            </p>
          </div>
          <div className="px-6 py-4">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders in the system yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          Created on {new Date(order.timestamp).toLocaleDateString()} at{' '}
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
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

                    {order.status === 'pending' && deliveryPersonnel.length > 0 && (
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-medium text-gray-700">Assign to:</p>
                        <div className="relative w-64">
                          <select
                            onChange={(e) => assignOrder(order.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            defaultValue=""
                          >
                            <option value="" disabled>Select delivery person</option>
                            {deliveryPersonnel.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {order.deliveryPersonId && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Assigned to:{' '}
                          <span className="font-medium">
                            {deliveryPersonnel.find(dp => dp.id === order.deliveryPersonId)?.name || 'Unknown'}
                          </span>
                        </p>
                      </div>
                    )}
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

export default AdminDashboard;