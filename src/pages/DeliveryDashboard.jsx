import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Package, MapPin, Clock, CheckCircle } from 'lucide-react';

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

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState([]);

  useEffect(() => {
    if (user) {
      loadAssignedOrders();
    }
  }, [user]);

  const loadAssignedOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('deliveryflow_orders') || '[]');
    const myOrders = allOrders.filter((order) => 
      order.deliveryPersonId === user?.id && order.status !== 'delivered'
    );
    setAssignedOrders(myOrders);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const allOrders = JSON.parse(localStorage.getItem('deliveryflow_orders') || '[]');
    const updatedOrders = allOrders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    
    localStorage.setItem('deliveryflow_orders', JSON.stringify(updatedOrders));
    loadAssignedOrders();

    toast.success(`Order ${orderId} has been marked as ${newStatus.replace('-', ' ')}.`);
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  const getDeliveredCount = () => {
    const allOrders = JSON.parse(localStorage.getItem('deliveryflow_orders') || '[]');
    return allOrders.filter((order) => 
      order.deliveryPersonId === user?.id && order.status === 'delivered'
    ).length;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your delivery assignments and update order status.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{assignedOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Picked Up</p>
                <p className="text-2xl font-bold text-purple-600">
                  {assignedOrders.filter(o => o.status === 'picked-up').length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{getDeliveredCount()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Assigned Orders */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Your Assigned Deliveries</h3>
            <p className="text-sm text-gray-600">
              View and update the status of your delivery assignments
            </p>
          </div>
          <div className="px-6 py-4">
            {assignedOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No active deliveries</p>
                <p className="text-sm text-gray-400">
                  New deliveries will appear here when assigned by admin
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignedOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          Assigned on {new Date(order.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Pickup Address:</p>
                          <p className="text-gray-600">{order.pickupAddress}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Delivery Address:</p>
                          <p className="text-gray-600">{order.dropAddress}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Item Description:</p>
                        <p className="text-gray-600">{order.itemDescription}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {order.status === 'assigned' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'picked-up')}
                          className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                        >
                          Mark as Picked Up
                        </button>
                      )}
                      {order.status === 'picked-up' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md"
                        >
                          Mark as Delivered
                        </button>
                      )}
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

export default DeliveryDashboard;