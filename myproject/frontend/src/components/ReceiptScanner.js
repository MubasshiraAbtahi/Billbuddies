import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useScanReceipt } from '../utils/useScanReceipt';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';

const ReceiptScanner = ({ groupId, onExpenseCreated }) => {
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const fileInputRef = useRef(null);
  const { scanReceipt, createExpenseFromScan } = useScanReceipt();

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await scanReceipt(file);
      if (result.success) {
        setScannedData(result.data);
        setEditingData(JSON.parse(JSON.stringify(result.data))); // Deep copy
        setShowModal(true);
        toast.success('Receipt scanned successfully!');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to scan receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExpense = async () => {
    if (!selectedItems || Object.keys(selectedItems).length === 0) {
      toast.error('Please assign items to members');
      return;
    }

    setLoading(true);
    try {
      // Create splits based on selected items
      const splits = {};
      Object.entries(selectedItems).forEach(([itemIndex, memberId]) => {
        if (!splits[memberId]) {
          splits[memberId] = 0;
        }
        splits[memberId] += editingData.items[itemIndex].price;
      });

      const splitArray = Object.entries(splits).map(([userId, amount]) => ({
        userId,
        amount: parseFloat(amount.toFixed(2)),
      }));

      await createExpenseFromScan(
        { ...scannedData, data: editingData },
        groupId,
        splitArray
      );

      toast.success('Expense created from receipt!');
      setShowModal(false);
      setScannedData(null);
      setEditingData(null);
      setSelectedItems({});
      onExpenseCreated?.();
    } catch (error) {
      toast.error('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const updateItemAmount = (index, newAmount) => {
    const updated = { ...editingData };
    updated.items[index].price = parseFloat(newAmount);
    setEditingData(updated);
  };

  const addItem = () => {
    const updated = { ...editingData };
    updated.items.push({ name: '', price: 0 });
    setEditingData(updated);
  };

  const removeItem = (index) => {
    const updated = { ...editingData };
    updated.items.splice(index, 1);
    setEditingData(updated);
    const newSelected = { ...selectedItems };
    delete newSelected[index];
    setSelectedItems(newSelected);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FiCamera /> Scan Receipt
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {showModal && editingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Review Receipt</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Merchant and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Merchant</label>
                  <input
                    type="text"
                    value={editingData.merchant || ''}
                    onChange={(e) =>
                      setEditingData({ ...editingData, merchant: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={editingData.date?.split('T')[0] || ''}
                    onChange={(e) =>
                      setEditingData({ ...editingData, date: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-bold mb-2">Items (OCR Confidence: {editingData.ocrConfidence}%)</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {editingData.items?.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...editingData.items];
                          updated[index].name = e.target.value;
                          setEditingData({ ...editingData, items: updated });
                        }}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        placeholder="Item name"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItemAmount(index, e.target.value)}
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addItem}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Item
                </button>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded">
                <div>
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="font-bold">${editingData.subtotal?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="font-bold">${editingData.tax?.amount?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-lg">${editingData.total?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmExpense}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceiptScanner;
