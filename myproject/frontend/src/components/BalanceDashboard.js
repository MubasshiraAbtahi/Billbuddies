import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import { FiArrowDown, FiArrowUp } from 'react-icons/fi';

const BalanceDashboard = () => {
  const [balances, setBalances] = useState({
    totalOwed: 0,
    totalDue: 0,
    debts: [],
    credits: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await apiClient.get('/payment/dashboard');
      setBalances(response.data);
    } catch (error) {
      toast.error('Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (debtId, amount) => {
    try {
      await apiClient.post(`/payment/record-payment`, {
        toUserId: debtId,
        amount,
      });
      toast.success('Payment recorded!');
      fetchBalances();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">You Owe</p>
              <p className="text-3xl font-bold text-red-700">${balances.totalOwed.toFixed(2)}</p>
            </div>
            <FiArrowDown className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">You are Owed</p>
              <p className="text-3xl font-bold text-green-700">${balances.totalDue.toFixed(2)}</p>
            </div>
            <FiArrowUp className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Debts */}
      <div>
        <h2 className="text-xl font-bold mb-4">You Owe</h2>
        <div className="space-y-2">
          {balances.debts.length > 0 ? (
            balances.debts.map((debt) => (
              <div key={debt._id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                <div>
                  <p className="font-semibold">{debt.creditor.username}</p>
                  <p className="text-sm text-gray-600">${debt.amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRecordPayment(debt.creditor._id, debt.amount)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Pay
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No debts</p>
          )}
        </div>
      </div>

      {/* Credits */}
      <div>
        <h2 className="text-xl font-bold mb-4">You Are Owed</h2>
        <div className="space-y-2">
          {balances.credits.length > 0 ? (
            balances.credits.map((credit) => (
              <div key={credit._id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                <div>
                  <p className="font-semibold">{credit.debtor.username}</p>
                  <p className="text-sm text-gray-600">${credit.amount.toFixed(2)}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Pending</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No credits</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceDashboard;
