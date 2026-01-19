import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import BalanceDashboard from './components/BalanceDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {user && <Navigation />}

      <main className={user ? 'max-w-7xl mx-auto px-4 py-8' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={() => {}} />} />
          <Route path="/signup" element={<SignupPage onSignupSuccess={() => {}} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/balances"
            element={
              <ProtectedRoute>
                <BalanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

function Navigation() {
  const { logout } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Bill Buddies</h1>
        <button
          onClick={logout}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default App;
