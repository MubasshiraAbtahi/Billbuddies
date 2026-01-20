import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { Balance } from '../models/Payment.js';

const router = express.Router();

// Calculate splits based on method with validation
const calculateSplits = (totalAmount, method, memberIds, data) => {
  const splits = [];

  if (method === 'equal') {
    // Equal split: divide total by number of members
    const perPerson = totalAmount / memberIds.length;
    memberIds.forEach((memberId) => {
      splits.push({
        userId: memberId,
        amount: parseFloat(perPerson.toFixed(2)),
      });
    });
  } else if (method === 'percentage') {
    // Percentage split: use provided percentages
    if (!data.percentages || data.percentages.length !== memberIds.length) {
      throw new Error('Percentages must be provided for all members');
    }

    // Verify percentages add up to 100
    const totalPercentage = data.percentages.reduce((sum, p) => sum + p, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Percentages must add up to 100%');
    }

    memberIds.forEach((memberId, index) => {
      const splitAmount = (totalAmount * data.percentages[index]) / 100;
      splits.push({
        userId: memberId,
        amount: parseFloat(splitAmount.toFixed(2)),
        percentage: data.percentages[index],
      });
    });
  } else if (method === 'custom') {
    // Custom split: use exact amounts provided
    if (!data.customAmounts) {
      throw new Error('Custom amounts must be provided');
    }

    let totalSplitAmount = 0;
    memberIds.forEach((memberId, index) => {
      const amount = parseFloat(data.customAmounts[index] || 0);
      totalSplitAmount += amount;
      splits.push({
        userId: memberId,
        amount: parseFloat(amount.toFixed(2)),
      });
    });

    // Verify total matches
    if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      throw new Error(`Custom amounts (${totalSplitAmount}) must equal total (${totalAmount})`);
    }
  } else if (method === 'itemized') {
    // Itemized split: calculated from items assigned to people
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Items must be provided for itemized split');
    }

    const memberTotals = {};
    memberIds.forEach((id) => {
      memberTotals[id.toString()] = 0;
    });

    // Sum items assigned to each person
    data.items.forEach((item) => {
      if (item.assignedTo) {
        const userId = item.assignedTo.toString();
        if (userId in memberTotals) {
          memberTotals[userId] += item.price || 0;
        }
      }
    });

    // Add tax and tip if provided
    if (data.tax) {
      const taxAmount = data.tax.amount || 0;
      if (data.tax.splitMethod === 'equal') {
        const taxPerPerson = taxAmount / memberIds.length;
        memberIds.forEach((id) => {
          memberTotals[id.toString()] += parseFloat(taxPerPerson.toFixed(2));
        });
      } else if (data.tax.splitMethod === 'proportional') {
        // Split tax proportionally based on food costs
        let totalFood = Object.values(memberTotals).reduce((sum, val) => sum + val, 0);
        memberIds.forEach((id) => {
          const proportion = totalFood > 0 ? memberTotals[id.toString()] / totalFood : 0;
          memberTotals[id.toString()] += parseFloat((taxAmount * proportion).toFixed(2));
        });
      }
    }

    if (data.tip) {
      const tipAmount = data.tip.amount || 0;
      if (data.tip.splitMethod === 'equal') {
        const tipPerPerson = tipAmount / memberIds.length;
        memberIds.forEach((id) => {
          memberTotals[id.toString()] += parseFloat(tipPerPerson.toFixed(2));
        });
      } else if (data.tip.splitMethod === 'proportional') {
        // Split tip proportionally based on total so far
        let totalSoFar = Object.values(memberTotals).reduce((sum, val) => sum + val, 0);
        memberIds.forEach((id) => {
          const proportion = totalSoFar > 0 ? memberTotals[id.toString()] / totalSoFar : 0;
          memberTotals[id.toString()] += parseFloat((tipAmount * proportion).toFixed(2));
        });
      }
    }

    // Convert to splits array
    memberIds.forEach((memberId) => {
      splits.push({
        userId: memberId,
        amount: parseFloat(memberTotals[memberId.toString()].toFixed(2)),
        items: data.items.filter((item) => item.assignedTo && item.assignedTo.toString() === memberId.toString()),
      });
    });
  }

  return splits;
};

// Add expense with comprehensive validation
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
      splits: providedSplits,
      itemizedList,
      tax,
      tip,
      date,
      receiptImage,
      receiptData,
    } = req.body;

    // ============= VALIDATION LAYER 1: Required Fields =============
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Expense title is required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be a positive number',
      });
    }

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID is required',
      });
    }

    if (!splitMethod || !['equal', 'percentage', 'custom', 'itemized'].includes(splitMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid split method must be provided',
      });
    }

    // ============= VALIDATION LAYER 2: Group Access =============
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is member of the group
    const isMember = group.members.some(
      (member) => member.userId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // ============= VALIDATION LAYER 3: Member Validation =============
    const groupMemberIds = group.members.map((m) => m.userId.toString());

    // Get member IDs from splits
    let memberIds = [];
    if (splitMethod === 'itemized' && itemizedList) {
      memberIds = [
        ...new Set(
          itemizedList
            .filter((item) => item.assignedTo)
            .map((item) => item.assignedTo.toString())
        ),
      ];
    } else if (providedSplits && Array.isArray(providedSplits)) {
      memberIds = providedSplits.map((s) => s.userId || s);
    } else {
      // Default: all group members
      memberIds = groupMemberIds;
    }

    // Verify all members in split are actual group members
    for (const memberId of memberIds) {
      if (!groupMemberIds.includes(memberId.toString())) {
        return res.status(403).json({
          success: false,
          message: `User ${memberId} is not a member of this group`,
        });
      }
    }

    // ============= VALIDATION LAYER 4: Split Calculation =============
    let calculatedSplits;
    try {
      const splitData = {
        percentages: providedSplits?.map((s) => s.percentage),
        customAmounts: providedSplits?.map((s) => s.amount),
        items: itemizedList,
        tax,
        tip,
      };

      calculatedSplits = calculateSplits(
        amount,
        splitMethod,
        memberIds.map((id) => typeof id === 'string' ? id : id.toString()),
        splitData
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Split calculation error: ${error.message}`,
      });
    }

    // Verify splits add up to total amount (with 0.01 tolerance for rounding)
    const totalSplit = calculatedSplits.reduce((sum, s) => sum + (s.amount || 0), 0);
    if (Math.abs(totalSplit - amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Split amounts (${totalSplit.toFixed(2)}) do not equal total (${amount.toFixed(2)})`,
      });
    }

    // ============= Create Expense Record =============
    const expense = new Expense({
      title: title.trim(),
      description: description || '',
      amount: parseFloat(amount.toFixed(2)),
      currency: currency || 'USD',
      category: category || 'Other',
      payer: req.user._id,
      group: groupId,
      splitMethod,
      splits: calculatedSplits,
      itemizedList: itemizedList || [],
      tax: tax || { amount: 0, splitMethod: 'equal' },
      tip: tip || { amount: 0, splitMethod: 'equal' },
      receiptImage: receiptImage || null,
      receiptData: receiptData || null,
      date: date ? new Date(date) : new Date(),
    });

    await expense.save();
    await expense.populate('payer', 'username email profilePicture firstName lastName');

    // ============= Update Balance Records =============
    const balanceUpdates = [];
    for (const split of calculatedSplits) {
      const debtorId = split.userId;
      const creditorId = req.user._id;

      // Skip if person is the payer (no debt to self)
      if (debtorId.toString() === creditorId.toString()) {
        continue;
      }

      let balance = await Balance.findOne({
        debtor: debtorId,
        creditor: creditorId,
        group: groupId,
        status: { $in: ['pending', 'partial'] },
      });

      if (!balance) {
        balance = new Balance({
          debtor: debtorId,
          creditor: creditorId,
          group: groupId,
          amount: split.amount,
          currency: currency || 'USD',
          status: 'pending',
          expenses: [expense._id],
        });
      } else {
        balance.amount = (balance.amount || 0) + split.amount;
        balance.expenses.push(expense._id);
      }

      await balance.save();
      balanceUpdates.push({
        debtor: debtorId,
        creditor: creditorId,
        amount: split.amount,
        userName: split.userName,
      });
    }

    // ============= Update Group Stats =============
    group.totalExpenses = (group.totalExpenses || 0) + 1;
    group.totalSpent = parseFloat((group.totalSpent || 0) + amount).toFixed(2);
    await group.save();

    // ============= Send Notifications =============
    try {
      const { Notification } = await import('../models/Notification.js');
      const notificationPromises = calculatedSplits
        .filter((split) => split.userId.toString() !== req.user._id.toString())
        .map((split) =>
          Notification.create({
            recipient: split.userId,
            sender: req.user._id,
            type: 'expense_added',
            title: `New Expense: ${title}`,
            message: `${req.user.firstName} added "${title}" for $${split.amount.toFixed(2)}. You owe $${split.amount.toFixed(2)}.`,
            relatedId: expense._id,
            relatedType: 'Expense',
            groupId,
          })
        );

      await Promise.all(notificationPromises);
    } catch (notificationError) {
      console.log('Notification creation failed:', notificationError.message);
      // Don't fail expense creation if notifications fail
    }

    res.status(201).json({
      success: true,
      expense,
      splits: calculatedSplits,
      message: 'Expense added successfully',
    });
  })
);

// Preview split calculation without creating expense
router.post(
  '/preview/split',
  authenticate,
  asyncHandler(async (req, res) => {
    const {
      amount,
      groupId,
      splitMethod,
      splits: providedSplits,
      itemizedList,
      tax,
      tip,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Get member IDs for split
    let memberIds = [];
    if (splitMethod === 'itemized' && itemizedList) {
      memberIds = [
        ...new Set(
          itemizedList
            .filter((item) => item.assignedTo)
            .map((item) => item.assignedTo.toString())
        ),
      ];
    } else if (providedSplits && Array.isArray(providedSplits)) {
      memberIds = providedSplits.map((s) => s.userId || s);
    } else {
      memberIds = group.members.map((m) => m.userId.toString());
    }

    try {
      const splitData = {
        percentages: providedSplits?.map((s) => s.percentage),
        customAmounts: providedSplits?.map((s) => s.amount),
        items: itemizedList,
        tax,
        tip,
      };

      const calculatedSplits = calculateSplits(
        amount,
        splitMethod,
        memberIds.map((id) => (typeof id === 'string' ? id : id.toString())),
        splitData
      );

      // Populate member details
      const splitsWithDetails = await Promise.all(
        calculatedSplits.map(async (split) => {
          const user = await User.findById(split.userId).select('firstName lastName email profilePicture');
          return {
            ...split,
            user,
          };
        })
      );

      res.json({
        success: true,
        splits: splitsWithDetails,
        total: parseFloat(
          splitsWithDetails.reduce((sum, s) => sum + (s.amount || 0), 0).toFixed(2)
        ),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: `Split calculation error: ${error.message}`,
      });
    }
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

    if (expense.payer.toString() !== req.user._id.toString()) {
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

    if (expense.payer.toString() !== req.user._id.toString()) {
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

// Get recent activity feed (last 10 expenses across all user's groups)
router.get(
  '/activity/feed',
  authenticate,
  asyncHandler(async (req, res) => {
    // First, get all groups the user is part of
    const userGroups = await Group.find({
      'members.userId': req.user.id,
    });

    const groupIds = userGroups.map(g => g._id);

    // Get last 10 expenses from these groups
    const recentExpenses = await Expense.find({
      group: { $in: groupIds },
    })
      .populate('payer', 'username email profilePicture firstName lastName')
      .populate('group', 'name')
      .populate('splits.userId', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    // Add user's share for each expense
    const expensesWithShare = recentExpenses.map(expense => {
      const userSplit = expense.splits.find(
        split => split.userId._id.toString() === req.user.id
      );

      return {
        ...expense.toObject(),
        userShare: userSplit ? userSplit.amount : 0,
      };
    });

    res.json({
      success: true,
      expenses: expensesWithShare,
    });
  })
);

export default router;
