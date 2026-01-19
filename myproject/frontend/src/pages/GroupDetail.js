import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import ReceiptScanner from '../components/ReceiptScanner';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const response = await apiClient.get(`/group/${groupId}`);
      setGroup(response.data.group);
      setExpenses(response.data.expenses);
      setBalances(response.data.balances);
    } catch (error) {
      toast.error('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await apiClient.post('/expense/add', {
        ...expenseData,
        groupId,
      });
      toast.success('Expense added!');
      setShowAddExpense(false);
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!group) {
    return <div className="text-center py-8">Group not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
        <p className="text-gray-600">{group.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold">${group.totalSpent.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Members</p>
            <p className="text-2xl font-bold">{group.members.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <ReceiptScanner groupId={groupId} onExpenseCreated={fetchGroupData} />
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Manual Entry
        </button>
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-4">Expenses</h2>
        <div className="space-y-2">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense._id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">{expense.title}</p>
                  <p className="text-sm text-gray-600">
                    Paid by {expense.payer.username}
                  </p>
                </div>
                <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No expenses yet</p>
          )}
        </div>
      </div>

      {/* Balances */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold mb-4">Balances</h2>
        <div className="space-y-2">
          {balances.length > 0 ? (
            balances.map((balance) => (
              <div key={balance._id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">
                    {balance.debtor.username} → {balance.creditor.username}
                  </p>
                  <p className="text-sm text-gray-600">{balance.status}</p>
                </div>
                <p className="font-bold text-lg">${balance.amount.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No balances</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
