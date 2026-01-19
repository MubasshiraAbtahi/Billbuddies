import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function SettleUpModal({ balances, onClose, onSuccess }) {
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBalance) {
      toast.error('Please select a person to settle with');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payment/record-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          toUserId: selectedBalance.creditor._id,
          amount: selectedBalance.amount,
          groupId: selectedBalance.group?._id,
          method,
          description: notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment recorded successfully!');
        onSuccess();
      } else {
        toast.error(data.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Settle Up</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Person */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Person to Settle With *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {balances.length === 0 ? (
                <p className="text-gray-500 text-sm">You don't owe anyone</p>
              ) : (
                balances.map((balance) => (
                  <div
                    key={balance._id}
                    onClick={() => setSelectedBalance(balance)}
                    className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                      selectedBalance?._id === balance._id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {balance.creditor?.profilePicture ? (
                          <img
                            src={balance.creditor.profilePicture}
                            alt={balance.creditor.firstName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 text-xs font-medium">
                              {balance.creditor?.firstName?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {balance.creditor?.firstName} {balance.creditor?.lastName}
                          </p>
                          {balance.group && (
                            <p className="text-xs text-gray-500">{balance.group.name}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-red-600">${balance.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Amount */}
          {selectedBalance && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Pay
              </label>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  ${selectedBalance.amount.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {[
                { value: 'cash', label: '💵 Cash' },
                { value: 'venmo', label: '📱 Venmo' },
                { value: 'paypal', label: '🅿️ PayPal' },
                { value: 'bank', label: '🏦 Bank Transfer' },
              ].map((method_opt) => (
                <label
                  key={method_opt.value}
                  className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="method"
                    value={method_opt.value}
                    checked={method === method_opt.value}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="ml-3 text-gray-900">{method_opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add payment reference or notes..."
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
              disabled={loading || !selectedBalance}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettleUpModal;
