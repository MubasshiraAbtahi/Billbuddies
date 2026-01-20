import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Other',
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

function AddExpenseForm({ isOpen, onClose, onSuccess, defaultGroupId = null }) {
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: Split, Step 3: Preview
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [splitPreview, setSplitPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    category: 'Food',
    groupId: defaultGroupId || '',
    splitMethod: 'equal',
    date: new Date().toISOString().split('T')[0],
  });

  const [splitConfig, setSplitConfig] = useState({
    members: [],
    percentages: {},
    customAmounts: {},
  });

  // Fetch groups on mount
  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  // Update members when group changes
  useEffect(() => {
    if (formData.groupId) {
      const selectedGroup = groups.find((g) => g._id === formData.groupId);
      if (selectedGroup) {
        const members = selectedGroup.members.map((m) => ({
          _id: m.userId._id || m.userId,
          firstName: m.userId.firstName,
          lastName: m.userId.lastName,
          email: m.userId.email,
        }));
        setGroupMembers(members);

        // Initialize split config
        setSplitConfig((prev) => ({
          ...prev,
          members: members.map((m) => m._id),
          percentages: {},
          customAmounts: {},
        }));
      }
    }
  }, [formData.groupId, groups]);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get('/group/my-groups');
      if (response.data.success) {
        setGroups(response.data.groups || []);
        if (defaultGroupId) {
          setFormData((prev) => ({ ...prev, groupId: defaultGroupId }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const handlePreviewSplit = async () => {
    if (!formData.title || !formData.amount) {
      toast.error('Please fill in expense title and amount');
      return;
    }

    if (splitConfig.members.length === 0) {
      toast.error('Please select at least one member for the split');
      return;
    }

    setLoading(true);
    try {
      const splitData = {
        amount: parseFloat(formData.amount),
        groupId: formData.groupId,
        splitMethod: formData.splitMethod,
        splits: splitConfig.members.map((memberId) => ({
          userId: memberId,
          percentage: splitConfig.percentages[memberId] || 0,
          amount: splitConfig.customAmounts[memberId] || 0,
        })),
      };

      const response = await apiClient.post('/expense/preview/split', splitData);
      if (response.data.success) {
        setSplitPreview(response.data);
        setStep(3);
      } else {
        toast.error(response.data.message || 'Failed to calculate split');
      }
    } catch (error) {
      console.error('Error calculating split:', error);
      toast.error(error.response?.data?.message || 'Error calculating split');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    setLoading(true);
    try {
      const expenseData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        category: formData.category,
        groupId: formData.groupId,
        splitMethod: formData.splitMethod,
        splits: splitConfig.members.map((memberId) => ({
          userId: memberId,
          percentage: splitConfig.percentages[memberId],
          amount: splitConfig.customAmounts[memberId],
        })),
        date: formData.date,
      };

      const response = await apiClient.post('/expense/add', expenseData);
      if (response.data.success) {
        toast.success('Expense created successfully! 🎉');
        onSuccess();
        onClose();
        // Reset form
        setStep(1);
        setFormData({
          title: '',
          description: '',
          amount: '',
          currency: 'USD',
          category: 'Food',
          groupId: defaultGroupId || '',
          splitMethod: 'equal',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        toast.error(response.data.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error(error.response?.data?.message || 'Error creating expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {step} of 3: {step === 1 ? 'Expense Details' : step === 2 ? 'Split Method' : 'Preview & Confirm'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* STEP 1: Expense Details */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Group *
                </label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a group...</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.icon} {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Dinner at Olive Garden"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CURRENCY_OPTIONS.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any notes about this expense..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Split Method & Members */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Split Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Split Method
                </label>
                <div className="space-y-2">
                  {['equal', 'percentage', 'custom'].map((method) => (
                    <label key={method} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="splitMethod"
                        value={method}
                        checked={formData.splitMethod === method}
                        onChange={(e) => setFormData({ ...formData, splitMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">
                          {method === 'equal' && 'Split Equally'}
                          {method === 'percentage' && 'Split by Percentage'}
                          {method === 'custom' && 'Custom Amounts'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {method === 'equal' && 'Everyone pays the same amount'}
                          {method === 'percentage' && 'Specify percentage for each person'}
                          {method === 'custom' && 'Enter exact amount for each person'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Members Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Who is this expense for? *
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {groupMembers.map((member) => (
                    <div key={member._id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={member._id}
                        checked={splitConfig.members.includes(member._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSplitConfig((prev) => ({
                              ...prev,
                              members: [...prev.members, member._id],
                            }));
                          } else {
                            setSplitConfig((prev) => ({
                              ...prev,
                              members: prev.members.filter((id) => id !== member._id),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={member._id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </label>
                      {splitConfig.members.includes(member._id) && (
                        <span className="text-indigo-600 font-semibold">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preview */}
          {step === 3 && splitPreview && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900">Expense Summary</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Title:</span>
                    <span className="font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Amount:</span>
                    <span className="font-medium">${formData.amount} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Split Method:</span>
                    <span className="font-medium capitalize">{formData.splitMethod}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Split Breakdown</h3>
                <div className="space-y-3">
                  {splitPreview.splits.map((split) => (
                    <div key={split.userId._id || split.userId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium">
                          {split.user?.firstName} {split.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{split.user?.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ${split.amount?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-300">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${splitPreview.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          {step === 1 && (
            <button
              onClick={() => {
                if (!formData.title || !formData.amount || !formData.groupId) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                setStep(2);
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Next: Select Split
            </button>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handlePreviewSplit}
                disabled={loading || splitConfig.members.length === 0}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Calculating...' : 'Next: Preview'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleCreateExpense}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create Expense'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddExpenseForm;
