import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { ProfileCircle } from './UI';

function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Friends', path: '/friends', icon: '🤝' },
    { label: 'Groups', path: '/groups', icon: '👥' },
    { label: 'Activity', path: '/activity', icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b-2 border-brand-pink/20 sticky top-0 z-40 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Left: Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-sunset rounded-xl flex items-center justify-center shadow-medium">
              <span className="text-white font-bold text-lg">👥</span>
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple hidden sm:inline">
              Bill Buddies
            </span>
          </Link>

          {/* Center: Navigation Tabs */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-sunset text-white shadow-medium'
                    : 'text-gray-700 hover:bg-gray-100 hover:-translate-y-0.5'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative transition-all duration-300 hover:scale-110"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-brand-pink rounded-full animate-pulse"></span>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <ProfileCircle
                  name={`${user?.firstName} ${user?.lastName}`}
                  color="bg-brand-pink"
                  size="sm"
                />
                <ChevronDownIcon className={`w-4 h-4 text-gray-600 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-strong border border-gray-100 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-brand-lightPink to-brand-lightPurple/50 rounded-t-2xl">
                    <p className="font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-brand-lightPink transition-colors cursor-pointer"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5 text-brand-pink" />
                    <span className="font-medium">View Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-brand-lightOrange transition-colors cursor-pointer"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-brand-orange" />
                    <span className="font-medium">Settings</span>
                  </Link>

                  <Link
                    to="/payment-methods"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <CreditCardIcon className="w-5 h-5 text-brand-teal" />
                    <span className="font-medium">Payment Methods</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white bg-gradient-danger hover:shadow-medium transition-all cursor-pointer border-t border-gray-100 mt-2 rounded-b-2xl font-semibold"
                  >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 flex space-x-2 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-gradient-sunset text-white shadow-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
