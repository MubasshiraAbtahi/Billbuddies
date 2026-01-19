import React from 'react';
import { FiLogOut, FiHome, FiUsers, FiWallet } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/groups', label: 'Groups', icon: FiUsers },
    { path: '/balances', label: 'Balances', icon: FiWallet },
  ];

  return (
    <aside className="w-64 bg-indigo-700 text-white min-h-screen p-6 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bill Buddies</h1>
      </div>

      <nav className="space-y-2 mb-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-900'
                  : 'hover:bg-indigo-600'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-indigo-600 pt-6 space-y-4">
        <div className="text-sm">
          <p className="text-indigo-200">Logged in as</p>
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
