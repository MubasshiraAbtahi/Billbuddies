import React from 'react';
import { useNavigate } from 'react-router-dom';

function BalanceSummary({ balance, onAddExpense, onSettleUp }) {
  const navigate = useNavigate();

  const getBalanceColor = () => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceCardColor = () => {
    if (balance > 0) return 'bg-green-50 border-green-200';
    if (balance < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getBalanceText = () => {
    const absBalance = Math.abs(balance).toFixed(2);
    if (balance > 0) return `+$${absBalance} You are owed`;
    if (balance < 0) return `-$${absBalance} You owe`;
    return '$0.00 All settled up!';
  };

  return (
    <div className={`${getBalanceCardColor()} border-2 rounded-lg p-6 mb-6`}>
      <h2 className="text-gray-700 text-sm font-medium mb-2">TOTAL BALANCE</h2>
      <div className={`text-4xl font-bold ${getBalanceColor()} mb-6`}>
        {getBalanceText()}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onAddExpense}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Expense
        </button>
        <button
          onClick={onSettleUp}
          className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
        >
          Settle Up
        </button>
      </div>
    </div>
  );
}

export default BalanceSummary;
