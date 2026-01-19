import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { Balance, Payment } from '../models/Payment.js';
import Group from '../models/Group.js';

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

export default router;
