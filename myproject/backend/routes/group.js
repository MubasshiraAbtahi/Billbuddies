import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import { Balance } from '../models/Payment.js';

const router = express.Router();

// Create group
router.post(
  '/create',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, description, members, defaultSplitMethod, currency } = req.body;

    const group = new Group({
      name,
      description,
      creator: req.user.id,
      defaultSplitMethod: defaultSplitMethod || 'equal',
      currency: currency || 'USD',
      members: [
        { userId: req.user.id, role: 'admin' },
        ...members.map((memberId) => ({ userId: memberId, role: 'member' })),
      ],
    });

    await group.save();
    await group.populate('members.userId', 'username email profilePicture');

    res.status(201).json({
      success: true,
      group,
      message: 'Group created successfully',
    });
  })
);

// Get user's groups
router.get(
  '/my-groups',
  authenticate,
  asyncHandler(async (req, res) => {
    const groups = await Group.find({
      'members.userId': req.user.id,
      isArchived: false,
    }).populate('members.userId', 'username email profilePicture creator');

    res.json({
      success: true,
      groups,
    });
  })
);

// Get group details
router.get(
  '/:groupId',
  authenticate,
  asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId).populate(
      'members.userId',
      'username email profilePicture'
    );

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Get group expenses
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('payer', 'username email profilePicture')
      .sort({ createdAt: -1 });

    // Calculate balances
    const balances = await Balance.find({ group: req.params.groupId });

    res.json({
      success: true,
      group,
      expenses,
      balances,
    });
  })
);

// Add members to group
router.post(
  '/:groupId/add-members',
  authenticate,
  asyncHandler(async (req, res) => {
    const { memberIds } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = group.members.some(
      (m) => m.userId.toString() === req.user.id && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    const newMembers = memberIds.filter(
      (id) => !group.members.some((m) => m.userId.toString() === id)
    );

    group.members.push(
      ...newMembers.map((id) => ({ userId: id, role: 'member' }))
    );

    await group.save();
    await group.populate('members.userId', 'username email profilePicture');

    res.json({
      success: true,
      group,
      message: 'Members added',
    });
  })
);

// Leave group
router.post(
  '/:groupId/leave',
  authenticate,
  asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check for unsettled balances
    const unsettledBalances = await Balance.findOne({
      group: req.params.groupId,
      $or: [
        { debtor: req.user.id, status: 'pending' },
        { creditor: req.user.id, status: 'pending' },
      ],
    });

    if (unsettledBalances) {
      return res.status(400).json({
        message: 'Cannot leave group with unsettled balances',
      });
    }

    group.members = group.members.filter(
      (m) => m.userId.toString() !== req.user.id
    );

    await group.save();

    res.json({
      success: true,
      message: 'Left group successfully',
    });
  })
);

// Archive group
router.post(
  '/:groupId/archive',
  authenticate,
  asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isAdmin = group.members.some(
      (m) => m.userId.toString() === req.user.id && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can archive groups' });
    }

    group.isArchived = true;
    await group.save();

    res.json({
      success: true,
      message: 'Group archived',
    });
  })
);

// Delete group (only creator)
router.delete(
  '/:groupId',
  authenticate,
  asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can delete group' });
    }

    await Group.deleteOne({ _id: req.params.groupId });

    res.json({
      success: true,
      message: 'Group deleted',
    });
  })
);

export default router;
