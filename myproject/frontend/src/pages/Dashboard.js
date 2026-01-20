import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';
import BalanceSummary from '../components/BalanceSummaryCard';
import OutstandingBalances from '../components/OutstandingBalances';
import ActivityFeed from '../components/ActivityFeed';
import QuickAccessCards from '../components/QuickAccessCards';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';
import toast from 'react-hot-toast';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment/summary/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setDashboardData(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">Here's your financial summary</p>
        </div>

        {/* Section 1: Balance Summary */}
        <BalanceSummary
          balance={dashboardData?.balance?.total || 0}
          onAddExpense={() => setShowAddExpense(true)}
          onSettleUp={() => setShowSettleUp(true)}
        />

        {/* Section 2: Outstanding Balances */}
        <OutstandingBalances
          youOwe={dashboardData?.youOwe || []}
          youAreOwed={dashboardData?.youAreOwed || []}
        />

        {/* Section 3: Recent Activity Feed */}
        <ActivityFeed expenses={dashboardData?.recentExpenses || []} />

        {/* Section 4: Quick Access Cards */}
        <QuickAccessCards
          groupsCount={dashboardData?.groupsCount || 0}
          friendsCount={dashboardData?.friendsCount || 0}
          pendingRequests={dashboardData?.pendingRequests || 0}
        />
      </div>

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onSuccess={() => {
            setShowAddExpense(false);
            fetchDashboardData();
          }}
        />
      )}

      {showSettleUp && (
        <SettleUpModal
          balances={dashboardData?.youOwe || []}
          onClose={() => setShowSettleUp(false)}
          onSuccess={() => {
            setShowSettleUp(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;
