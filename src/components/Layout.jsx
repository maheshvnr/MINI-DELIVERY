import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, Menu, X, User, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'customer':
        return '/customer-dashboard';
      case 'delivery':
        return '/delivery-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-primary font-semibold text-xl">
              <Package className="h-8 w-8" />
              <span>DeliveryFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="text-gray-600 hover:text-primary transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{user.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-primary flex items-center text-sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link to="/register">
                    <button className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-in">
            <div className="px-4 py-4 space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-600 pb-2 border-b border-gray-100">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    className="block text-gray-600 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-600 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <button className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary font-semibold">
                <Package className="h-6 w-6" />
                <span>DeliveryFlow</span>
              </div>
              <p className="text-gray-600 text-sm">
                Modern delivery management made simple and efficient.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Place Orders</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Track Deliveries</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Order History</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">For Delivery</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors duration-200">View Tasks</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Update Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Earnings</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>&copy; 2024 DeliveryFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;