import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ActivityFeed({ expenses = [] }) {
  const navigate = useNavigate();
  const [selectedExpense, setSelectedExpense] = useState(null);

  const getCategoryColor = (category) => {
    const colors = {
      Food: 'bg-blue-100 text-blue-700',
      Rent: 'bg-purple-100 text-purple-700',
      Travel: 'bg-green-100 text-green-700',
      Entertainment: 'bg-pink-100 text-pink-700',
      Utilities: 'bg-yellow-100 text-yellow-700',
      Other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.Other;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No expenses yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              onClick={() => navigate(`/expense/${expense._id}`)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {expense.payer?.profilePicture ? (
                    <img
                      src={expense.payer.profilePicture}
                      alt={expense.payer.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 text-xs font-medium">
                        {expense.payer?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-gray-900">{expense.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{expense.payer?.username} paid</span>
                      {expense.group && (
                        <>
                          <span>•</span>
                          <span>{expense.group.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right ml-4">
                <p className="font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                  {expense.userShare > 0 && (
                    <span className="text-sm text-indigo-600 font-medium">
                      Your share: ${expense.userShare.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
