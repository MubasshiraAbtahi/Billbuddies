import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OutstandingBalances({ youOwe = [], youAreOwed = [] }) {
  const [activeTab, setActiveTab] = useState('owed');
  const navigate = useNavigate();

  const renderPersonItem = (item, isOwed = false) => {
    const person = isOwed ? item.debtor : item.creditor;
    
    return (
      <div
        key={item._id}
        onClick={() => navigate(`/balance/${person._id}`, { state: { balance: item, isOwed } })}
        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow"
      >
        <div className="flex items-center space-x-4">
          {person.profilePicture ? (
            <img
              src={person.profilePicture}
              alt={person.firstName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {person.firstName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">
              {person.firstName} {person.lastName}
            </p>
            {item.group && (
              <p className="text-sm text-gray-500">{item.group.name}</p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className={`font-bold text-lg ${isOwed ? 'text-green-600' : 'text-red-600'}`}>
            ${item.amount.toFixed(2)}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isOwed) {
                // Send reminder
              } else {
                navigate(`/settle/${person._id}`, { state: { amount: item.amount } });
              }
            }}
            className={`text-sm font-medium px-3 py-1 rounded mt-2 ${
              isOwed
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            {isOwed ? 'Remind' : 'Settle'}
          </button>
        </div>
      </div>
    );
  };

  const activeItems = activeTab === 'owed' ? youOwe : youAreOwed;
  const isOwedTab = activeTab === 'owed';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Outstanding Balances</h3>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('owed')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'owed'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          You Owe ({youOwe.length})
        </button>
        <button
          onClick={() => setActiveTab('ared')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'ared'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          You Are Owed ({youAreOwed.length})
        </button>
      </div>

      {/* Content */}
      {activeItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'owed' ? (
            <p>You don't owe anyone money. You're all settled up!</p>
          ) : (
            <p>No one owes you money right now.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeItems.map((item) =>
            renderPersonItem(item, !isOwedTab)
          )}
        </div>
      )}
    </div>
  );
}

export default OutstandingBalances;
