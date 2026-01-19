import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { Balance } from '../models/Payment.js';

const router = express.Router();

// Calculate splits based on method
const calculateSplits = (amount, method, members, percentages) => {
  const splits = [];

  if (method === 'equal') {
    const perPerson = amount / members.length;
    members.forEach((memberId) => {
      splits.push({
        userId: memberId,
        amount: parseFloat(perPerson.toFixed(2)),
      });
    });
  } else if (method === 'percentage') {
    members.forEach((memberId, index) => {
      const splitAmount = (amount * percentages[index]) / 100;
      splits.push({
        userId: memberId,
        amount: parseFloat(splitAmount.toFixed(2)),
        percentage: percentages[index],
      });
    });
  }

  return splits;
};

// Add expense
router.post(
  '/add',
  authenticate,
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      amount,
      currency,
      category,
      groupId,
      splitMethod,
      splits,
      itemizedList,
      tax,
      tip,
      date,
    } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const expense = new Expense({
      title,
      description,
      amount,
      currency: currency || 'USD',
      category: category || 'Other',
      payer: req.user.id,
      group: groupId,
      splitMethod,
      splits: splits || [],
      itemizedList: itemizedList || [],
      tax,
      tip,
      date: date || new Date(),
    });

    await expense.save();

    // Create balance records
    if (splits && splits.length > 0) {
      for (const split of splits) {
        if (split.userId && split.userId.toString() !== req.user.id) {
          let balance = await Balance.findOne({
            debtor: split.userId,
            creditor: req.user.id,
            group: groupId,
          });

          if (!balance) {
            balance = new Balance({
              debtor: split.userId,
              creditor: req.user.id,
              group: groupId,
              amount: split.amount,
              currency: currency || 'USD',
              expenses: [expense._id],
            });
          } else {
            balance.amount += split.amount;
            balance.expenses.push(expense._id);
          }

          await balance.save();
        }
      }
    }

    // Update group stats
    group.totalExpenses += 1;
    group.totalSpent += amount;
    await group.save();

    res.status(201).json({
      success: true,
      expense,
      message: 'Expense added successfully',
    });
  })
);

// Get group expenses
router.get(
  '/group/:groupId',
  authenticate,
  asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('payer', 'username email profilePicture')
      .populate('splits.userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      expenses,
    });
  })
);

// Get single expense
router.get(
  '/:expenseId',
  authenticate,
  asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.expenseId)
      .populate('payer', 'username email profilePicture')
      .populate('splits.userId', 'username email profilePicture')
      .populate('comments.userId', 'username profilePicture');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({
      success: true,
      expense,
    });
  })
);

// Edit expense
router.put(
  '/:expenseId',
  authenticate,
  asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.payer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only payer can edit expense' });
    }

    // Store edit history
    expense.editHistory.push({
      editedAt: new Date(),
      editedBy: req.user.id,
      changes: req.body,
    });

    const { title, description, amount, category, splitMethod, splits } = req.body;

    if (title) expense.title = title;
    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (splitMethod) expense.splitMethod = splitMethod;
    if (splits) expense.splits = splits;

    await expense.save();

    res.json({
      success: true,
      expense,
      message: 'Expense updated',
    });
  })
);

// Delete expense
router.delete(
  '/:expenseId',
  authenticate,
  asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.payer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only payer can delete expense' });
    }

    // Delete related balances
    await Balance.deleteMany({ expenses: req.params.expenseId });

    await Expense.deleteOne({ _id: req.params.expenseId });

    res.json({
      success: true,
      message: 'Expense deleted',
    });
  })
);

// Add comment to expense
router.post(
  '/:expenseId/comment',
  authenticate,
  asyncHandler(async (req, res) => {
    const { text } = req.body;
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.comments.push({
      userId: req.user.id,
      text,
    });

    await expense.save();

    res.status(201).json({
      success: true,
      comment: expense.comments[expense.comments.length - 1],
      message: 'Comment added',
    });
  })
);

// Flag expense as disputed
router.post(
  '/:expenseId/dispute',
  authenticate,
  asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.isDisputed = true;
    await expense.save();

    res.json({
      success: true,
      message: 'Expense flagged as disputed',
    });
  })
);

export default router;
