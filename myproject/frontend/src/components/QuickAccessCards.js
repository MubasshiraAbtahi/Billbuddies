import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuickAccessCards({ groupsCount, friendsCount, pendingRequests }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Groups Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900">Groups</h4>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold">👥</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">{groupsCount}</p>
          <p className="text-sm text-gray-500">Total groups</p>
        </div>

        <button
          onClick={() => navigate('/groups')}
          className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
        >
          See All Groups
        </button>
      </div>

      {/* Friends Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900">Friends</h4>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-bold">😊</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">{friendsCount}</p>
          {pendingRequests > 0 && (
            <p className="text-sm text-orange-600 font-medium">
              {pendingRequests} pending request{pendingRequests !== 1 ? 's' : ''}
            </p>
          )}
          {pendingRequests === 0 && (
            <p className="text-sm text-gray-500">Total friends</p>
          )}
        </div>

        <button
          onClick={() => navigate('/friends')}
          className="w-full bg-green-50 text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-100 transition-colors text-sm"
        >
          Manage Friends
        </button>
      </div>

      {/* Analytics Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900">Analytics</h4>
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-bold">📊</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">--</p>
          <p className="text-sm text-gray-500">Monthly spending</p>
        </div>

        <button
          onClick={() => navigate('/reports')}
          className="w-full bg-purple-50 text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-100 transition-colors text-sm"
        >
          View Reports
        </button>
      </div>
    </div>
  );
}

export default QuickAccessCards;
