import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import { Balance } from '../models/Payment.js';
import { Friendship, FriendRequest } from '../models/Friend.js';

const router = express.Router();

// Create group
router.post(
  '/create',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, description, members, defaultSplitMethod, currency, icon } = req.body;
    const userId = req.user._id;

    // Validation 1: Group name is required
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    // Validation 2: At least one member must be selected
    if (!members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one member',
      });
    }

    // Validation 3: CRITICAL - Verify all selected members are actually friends
    // This prevents malicious users from manipulating the frontend and adding non-friends
    const friendIds = await Friendship.find({
      $or: [
        { user1: userId, status: 'active' },
        { user2: userId, status: 'active' },
      ],
    }).select('user1 user2');

    // Create a set of friend IDs for efficient lookup
    const actualFriendIds = new Set();
    friendIds.forEach((friendship) => {
      const friendId = friendship.user1.toString() === userId.toString() 
        ? friendship.user2.toString() 
        : friendship.user1.toString();
      actualFriendIds.add(friendId);
    });

    // Check if all selected members are in the friends list
    const unauthorizedMembers = members.filter(
      (memberId) => !actualFriendIds.has(memberId.toString())
    );

    if (unauthorizedMembers.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only add friends to a group. Some selected members are not your friends.',
      });
    }

    // Create the group
    const group = new Group({
      name,
      description,
      icon: icon || '👥',
      creator: userId,
      defaultSplitMethod: defaultSplitMethod || 'equal',
      currency: currency || 'USD',
      members: [
        { userId, role: 'admin' },
        ...members.map((memberId) => ({ userId: memberId, role: 'member' })),
      ],
    });

    await group.save();
    await group.populate('members.userId', 'username email profilePicture firstName lastName');

    // Send notifications to newly added members
    try {
      const { Notification } = await import('../models/Notification.js');
      const memberPromises = members.map((memberId) =>
        Notification.create({
          recipient: memberId,
          sender: userId,
          type: 'group_invite',
          title: `Added to Group: ${name}`,
          message: `You've been added to "${name}" by ${req.user.firstName}`,
          relatedId: group._id,
          relatedType: 'Group',
        })
      );
      await Promise.all(memberPromises);
    } catch (notificationError) {
      console.log('Notification creation failed, but group was created:', notificationError.message);
      // Don't fail group creation if notifications fail
    }

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
      'members.userId': req.user._id,
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
      (m) => m.userId.toString() === req.user._id.toString() && m.role === 'admin'
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
        { debtor: req.user._id, status: 'pending' },
        { creditor: req.user._id, status: 'pending' },
      ],
    });

    if (unsettledBalances) {
      return res.status(400).json({
        message: 'Cannot leave group with unsettled balances',
      });
    }

    group.members = group.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
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
      (m) => m.userId.toString() === req.user._id.toString() && m.role === 'admin'
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

    if (group.creator.toString() !== req.user._id.toString()) {
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
