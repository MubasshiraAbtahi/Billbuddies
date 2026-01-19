import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function AddExpenseModal({ onClose, onSuccess, defaultGroupId = null }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'USD',
    category: 'Other',
    groupId: defaultGroupId || '',
    payer: user?._id || '',
    splitMethod: 'equal',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedSplitMembers, setSelectedSplitMembers] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/group/my-groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups || []);
        if (defaultGroupId) {
          setFormData(prev => ({ ...prev, groupId: defaultGroupId }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleGroupChange = (groupId) => {
    setFormData({ ...formData, groupId });
    const selectedGroup = groups.find(g => g._id === groupId);
    if (selectedGroup) {
      setSelectedSplitMembers(
        selectedGroup.members.map(m => m.userId._id || m.userId)
      );
    }
  };

  const handleSplitMemberToggle = (memberId) => {
    setSelectedSplitMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.groupId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedSplitMembers.length === 0) {
      toast.error('Please select at least one person to split with');
      return;
    }

    setLoading(true);

    try {
      let splits = [];
      if (formData.splitMethod === 'equal') {
        const amountPerPerson = parseFloat(formData.amount) / selectedSplitMembers.length;
        splits = selectedSplitMembers.map(memberId => ({
          userId: memberId,
          amount: parseFloat(amountPerPerson.toFixed(2)),
        }));
      }

      const expenseData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        category: formData.category,
        groupId: formData.groupId,
        splitMethod: formData.splitMethod,
        splits,
        date: formData.date,
      };

      const response = await fetch('/api/expense/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Expense added successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Error adding expense');
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = groups.find(g => g._id === formData.groupId);
  const groupMembers = selectedGroup?.members || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Lunch, Gas, Groceries"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CAD</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Food</option>
              <option>Rent</option>
              <option>Travel</option>
              <option>Entertainment</option>
              <option>Utilities</option>
              <option>Other</option>
            </select>
          </div>

          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Group *
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select a group --</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Who Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who Paid?
            </label>
            <input
              type="text"
              value={user?.firstName || 'You'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          {/* Split Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Method
            </label>
            <select
              value={formData.splitMethod}
              onChange={(e) => setFormData({ ...formData, splitMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="equal">Equal Split</option>
              <option value="percentage">Percentage</option>
              <option value="custom">Custom Amount</option>
            </select>
          </div>

          {/* Split Members */}
          {selectedGroup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Between *
              </label>
              <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {groupMembers.map((member) => {
                  const memberId = member.userId._id || member.userId;
                  const memberName = member.userId.firstName || member.userId.username;
                  
                  return (
                    <label
                      key={memberId}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSplitMembers.includes(memberId)}
                        onChange={() => handleSplitMemberToggle(memberId)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="ml-3 text-gray-700">{memberName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
