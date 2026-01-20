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
import { ColorfulButton, LoadingSpinner, ProfileCircle } from '../components/UI';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center min-h-[500px]">
          <div className="text-center">
            <LoadingSpinner size="lg" color="brand-pink" />
            <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const balanceAmount = dashboardData?.balance?.total || 0;
  const isOwing = balanceAmount < 0;
  const isOwed = balanceAmount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TopNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card Section */}
        <div className="mb-8 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-medium p-8 border-l-4 border-gradient-sunset">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <ProfileCircle
                  name={`${user?.firstName} ${user?.lastName}`}
                  image={user?.profilePicture}
                  color="bg-gradient-sunset"
                  size="xl"
                  ring={true}
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-gray-600 mt-1">Let's manage your shared expenses together</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-500">Last synced</span>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  ✓ Now
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with Collaborative Image */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative bg-gradient-to-r from-brand-pink/10 via-brand-purple/10 to-brand-orange/10 rounded-2xl overflow-hidden shadow-medium">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-72 h-72 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-brand-orange rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-brand-teal rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>
            <div className="relative px-8 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Collaborate & Split Smartly 🤝
                </h2>
                <p className="text-lg text-gray-700 mb-6 max-w-lg">
                  Make expense sharing effortless with friends and groups. Track who owes whom and settle up in seconds.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <ColorfulButton
                    gradient="sunset"
                    size="md"
                    onClick={() => setShowAddExpense(true)}
                  >
                    ➕ Add Expense
                  </ColorfulButton>
                  <ColorfulButton
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/groups')}
                  >
                    👥 View Groups
                  </ColorfulButton>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <img 
                  src="/hero-image.jpg" 
                  alt="Collaborative expense sharing" 
                  className="w-full max-w-md h-auto drop-shadow-lg hover:scale-105 transition-transform duration-300 rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Balance Display Card */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className={`rounded-2xl shadow-medium p-8 text-white relative overflow-hidden ${
            isOwing ? 'bg-gradient-danger' : isOwed ? 'bg-gradient-success' : 'bg-gradient-ocean'
          }`}>
            {/* Decorative elements */}
            <div className="absolute top--10 right--10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom--5 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <p className="text-white/80 text-lg mb-2">Your Balance</p>
              <h2 className="text-5xl font-bold mb-6">
                {isOwing ? '-' : isOwed ? '+' : ''} ${Math.abs(balanceAmount).toFixed(2)}
              </h2>
              <p className="text-white/90 font-medium">
                {isOwing
                  ? '💸 You owe this amount to your friends'
                  : isOwed
                  ? '💰 Your friends owe you this amount'
                  : '✨ All settled up! No balances'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setShowAddExpense(true)}
            className="group relative bg-white rounded-2xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300 text-center active:scale-95 h-24 flex flex-col items-center justify-center hover:-translate-y-1"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</div>
            <span className="font-semibold text-gray-800 text-sm">Add Expense</span>
          </button>

          <button
            onClick={() => navigate('/groups')}
            className="group relative bg-white rounded-2xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300 text-center active:scale-95 h-24 flex flex-col items-center justify-center hover:-translate-y-1"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">👥</div>
            <span className="font-semibold text-gray-800 text-sm">Create Group</span>
          </button>

          <button
            onClick={() => navigate('/friends')}
            className="group relative bg-white rounded-2xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300 text-center active:scale-95 h-24 flex flex-col items-center justify-center hover:-translate-y-1"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🤝</div>
            <span className="font-semibold text-gray-800 text-sm">Friends</span>
          </button>

          <button
            onClick={() => setShowSettleUp(true)}
            className="group relative bg-white rounded-2xl p-6 shadow-subtle hover:shadow-medium transition-all duration-300 text-center active:scale-95 h-24 flex flex-col items-center justify-center hover:-translate-y-1"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">✓</div>
            <span className="font-semibold text-gray-800 text-sm">Settle Up</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white rounded-2xl p-6 shadow-subtle border-t-4 border-brand-pink">
            <p className="text-gray-600 text-sm font-medium">Friends Count</p>
            <p className="text-3xl font-bold text-brand-pink mt-2">{dashboardData?.friendsCount || 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-subtle border-t-4 border-brand-orange">
            <p className="text-gray-600 text-sm font-medium">Your Groups</p>
            <p className="text-3xl font-bold text-brand-orange mt-2">{dashboardData?.groupsCount || 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-subtle border-t-4 border-brand-teal">
            <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
            <p className="text-3xl font-bold text-brand-teal mt-2">{dashboardData?.pendingRequests || 0}</p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Balance Summary */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <BalanceSummary
              balance={dashboardData?.balance?.total || 0}
              onAddExpense={() => setShowAddExpense(true)}
              onSettleUp={() => setShowSettleUp(true)}
            />
          </div>

          {/* Section 2: Outstanding Balances */}
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <OutstandingBalances
              youOwe={dashboardData?.youOwe || []}
              youAreOwed={dashboardData?.youAreOwed || []}
            />
          </div>

          {/* Section 3: Recent Activity Feed */}
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <ActivityFeed expenses={dashboardData?.recentExpenses || []} />
          </div>
        </div>
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
