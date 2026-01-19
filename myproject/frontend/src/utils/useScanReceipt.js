import React, { useCallback } from 'react';
import apiClient from '../utils/api';

export const useScanReceipt = () => {
  const scanReceipt = useCallback(async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('receipt', imageFile);

      const response = await apiClient.post('/scanner/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const createExpenseFromScan = useCallback(async (scanData, groupId, splits) => {
    try {
      const expenseData = {
        groupId,
        title: scanData.data.merchant || 'Scanned Expense',
        amount: scanData.data.total,
        currency: scanData.data.currency,
        category: 'Food', // Could be improved with ML
        items: scanData.data.items,
        tax: scanData.data.tax,
        tip: scanData.data.tip,
        merchant: scanData.data.merchant,
        date: scanData.data.date,
        imagePath: scanData.imageUrl,
        splits,
      };

      const response = await apiClient.post('/scanner/create-expense', expenseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    scanReceipt,
    createExpenseFromScan,
  };
};
