import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Balance, Payment } from '../models/Payment.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// Get user's balance dashboard
router.get(
  '/dashboard',
  authenticate,
  asyncHandler(async (req, res) => {
    // Get what user owes
    const debts = await Balance.find({
      debtor: req.userId,
      status: 'pending',
    })
      .populate('creditor', 'username email profilePicture')
      .populate('group', 'name');

    // Get what others owe user
    const credits = await Balance.find({
      creditor: req.userId,
      status: 'pending',
    })
      .populate('debtor', 'username email profilePicture')
      .populate('group', 'name');

    // Calculate totals
    const totalOwed = debts.reduce((sum, balance) => sum + balance.amount, 0);
    const totalDue = credits.reduce((sum, balance) => sum + balance.amount, 0);

    res.json({
      success: true,
      totalOwed,
      totalDue,
      debts,
      credits,
    });
  })
);

// Simplify debts (optimize payment flow)
router.post(
  '/simplify-debts',
  authenticate,
  asyncHandler(async (req, res) => {
    const { groupId } = req.body;

    const balances = await Balance.find({ group: groupId });

    // Simple debt simplification algorithm
    const graph = {};
    balances.forEach((balance) => {
      const from = balance.debtor.toString();
      const to = balance.creditor.toString();

      if (!graph[from]) graph[from] = {};
      graph[from][to] = (graph[from][to] || 0) + balance.amount;
    });

    // Find simplified transactions
    const simplifiedTransactions = [];

    for (const from in graph) {
      for (const to in graph[from]) {
        const amount = graph[from][to];
        simplifiedTransactions.push({
          from,
          to,
          amount: parseFloat(amount.toFixed(2)),
        });
      }
    }

    res.json({
      success: true,
      simplifiedTransactions,
      message: 'Debts simplified',
    });
  })
);

// Record payment
router.post(
  '/record-payment',
  authenticate,
  asyncHandler(async (req, res) => {
    const { toUserId, amount, groupId, method, description } = req.body;

    const payment = new Payment({
      from: req.userId,
      to: toUserId,
      amount,
      method: method || 'manual',
      description,
      group: groupId,
      status: 'completed',
    });

    await payment.save();

    // Update balance
    const balance = await Balance.findOne({
      debtor: req.userId,
      creditor: toUserId,
      group: groupId,
    });

    if (balance) {
      balance.amount -= amount;

      if (balance.amount <= 0) {
        balance.status = 'paid';
        balance.amount = 0;
      } else {
        balance.status = 'partial';
      }

      await balance.save();
    }

    res.status(201).json({
      success: true,
      payment,
      message: 'Payment recorded',
    });
  })
);

// Get payment history
router.get(
  '/history/:groupId',
  authenticate,
  asyncHandler(async (req, res) => {
    const payments = await Payment.find({
      group: req.params.groupId,
    })
      .populate('from', 'username email')
      .populate('to', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments,
    });
  })
);

// Request payment (send reminder)
router.post(
  '/send-reminder',
  authenticate,
  asyncHandler(async (req, res) => {
    const { toUserId, amount, groupId } = req.body;

    // This would integrate with notification system
    const notification = {
      type: 'payment_reminder',
      recipient: toUserId,
      message: `${req.userId} is requesting $${amount}`,
      data: {
        from: req.userId,
        amount,
        groupId,
      },
    };

    res.json({
      success: true,
      notification,
      message: 'Reminder sent',
    });
  })
);

// Get user's balances (who owes you, who you owe)
router.get(
  '/balances',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get what user owes (user is debtor)
    const youOwe = await Balance.find({
      debtor: userId,
      status: { $in: ['pending', 'partial'] },
    })
      .populate('creditor', 'username email profilePicture firstName lastName')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    // Get what others owe user (user is creditor)
    const youAreOwed = await Balance.find({
      creditor: userId,
      status: { $in: ['pending', 'partial'] },
    })
      .populate('debtor', 'username email profilePicture firstName lastName')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalYouOwe = youOwe.reduce((sum, balance) => sum + balance.amount, 0);
    const totalYouAreOwed = youAreOwed.reduce((sum, balance) => sum + balance.amount, 0);
    const netBalance = totalYouAreOwed - totalYouOwe;

    res.json({
      success: true,
      youOwe,
      youAreOwed,
      totalYouOwe: parseFloat(totalYouOwe.toFixed(2)),
      totalYouAreOwed: parseFloat(totalYouAreOwed.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2)),
      status: netBalance > 0 ? 'owed' : netBalance < 0 ? 'owes' : 'settled',
    });
  })
);

// Get balance between two users
router.get(
  '/between/:otherUserId',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    // Get balance where current user is debtor
    const iDebtor = await Balance.find({
      debtor: userId,
      creditor: otherUserId,
      status: { $in: ['pending', 'partial'] },
    })
      .populate('expenses');

    // Get balance where current user is creditor
    const iCreditor = await Balance.find({
      debtor: otherUserId,
      creditor: userId,
      status: { $in: ['pending', 'partial'] },
    })
      .populate('expenses');

    const iOweTotal = iDebtor.reduce((sum, b) => sum + b.amount, 0);
    const theyOweTotal = iCreditor.reduce((sum, b) => sum + b.amount, 0);
    const netBalance = theyOweTotal - iOweTotal;

    res.json({
      success: true,
      iOwe: iOweTotal,
      theyOwe: theyOweTotal,
      netBalance,
      expenses: [...iDebtor.flatMap(b => b.expenses), ...iCreditor.flatMap(b => b.expenses)],
      status: netBalance > 0 ? 'they_owe' : netBalance < 0 ? 'i_owe' : 'settled',
    });
  })
);

// Get dashboard summary (all dashboard data in one endpoint)
router.get(
  '/summary/dashboard',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Get balances
    const youOwe = await Balance.find({
      debtor: userId,
      status: { $in: ['pending', 'partial'] },
    })
      .populate('creditor', 'username email profilePicture firstName lastName')
      .limit(5);

    const youAreOwed = await Balance.find({
      creditor: userId,
      status: { $in: ['pending', 'partial'] },
    })
      .populate('debtor', 'username email profilePicture firstName lastName')
      .limit(5);

    const totalYouOwe = youOwe.reduce((sum, balance) => sum + balance.amount, 0);
    const totalYouAreOwed = youAreOwed.reduce((sum, balance) => sum + balance.amount, 0);
    const netBalance = totalYouAreOwed - totalYouOwe;

    // Get recent expenses
    const recentExpenses = await Expense.find()
      .populate('payer', 'username profilePicture firstName lastName')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Count user's groups
    const groupsCount = await Group.countDocuments({
      'members.userId': userId,
      isArchived: false,
    });

    res.json({
      success: true,
      balance: {
        total: parseFloat(netBalance.toFixed(2)),
        youOwe: parseFloat(totalYouOwe.toFixed(2)),
        youAreOwed: parseFloat(totalYouAreOwed.toFixed(2)),
        status: netBalance > 0 ? 'owed' : netBalance < 0 ? 'owes' : 'settled',
      },
      youOwe,
      youAreOwed,
      recentExpenses,
      groupsCount,
    });
  })
);

export default router;
