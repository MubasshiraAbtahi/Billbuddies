import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../utils/api';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/group/my-groups');
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroupDetails = useCallback(async (groupId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/group/${groupId}`);
      setCurrentGroup(response.data.group);
      setExpenses(response.data.expenses);
      setBalances(response.data.balances);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = async (groupData) => {
    try {
      const response = await apiClient.post('/group/create', groupData);
      setGroups([...groups, response.data.group]);
      return response.data.group;
    } catch (error) {
      throw error;
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await apiClient.post('/expense/add', expenseData);
      setExpenses([response.data.expense, ...expenses]);
      return response.data.expense;
    } catch (error) {
      throw error;
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroup,
        expenses,
        balances,
        loading,
        fetchGroups,
        fetchGroupDetails,
        createGroup,
        addExpense,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within GroupProvider');
  }
  return context;
};
