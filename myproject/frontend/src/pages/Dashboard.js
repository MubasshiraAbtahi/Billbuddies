import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOwed: 0,
    totalDue: 0,
    groupCount: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [groupsRes, balanceRes] = await Promise.all([
        apiClient.get('/group/my-groups'),
        apiClient.get('/payment/dashboard'),
      ]);

      setGroups(groupsRes.data.groups);
      setStats({
        totalOwed: balanceRes.data.totalOwed,
        totalDue: balanceRes.data.totalDue,
        groupCount: groupsRes.data.groups.length,
      });
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-indigo-100">Manage your shared expenses with friends</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 text-sm mb-2">You Owe</p>
          <p className="text-3xl font-bold text-red-600">${stats.totalOwed.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 text-sm mb-2">You are Owed</p>
          <p className="text-3xl font-bold text-green-600">${stats.totalDue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <p className="text-gray-600 text-sm mb-2">Active Groups</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.groupCount}</p>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-4">Your Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.length > 0 ? (
            groups.map((group) => (
              <Link
                key={group._id}
                to={`/group/${group._id}`}
                className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{group.members.length} members</span>
                  <span className="font-semibold">${group.totalSpent.toFixed(2)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500">No groups yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
