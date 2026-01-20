import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Message from '../models/Message.js';

const router = express.Router();

// Send message
router.post(
  '/send',
  authenticate,
  asyncHandler(async (req, res) => {
    const { groupId, text, type, expenseId, paymentId, attachments } = req.body;

    const message = new Message({
      sender: req.user._id,
      group: groupId,
      text,
      type: type || 'text',
      expenseId,
      paymentId,
      attachments: attachments || [],
    });

    await message.save();
    await message.populate('sender', 'username profilePicture');

    res.status(201).json({
      success: true,
      message,
      messageText: 'Message sent',
    });
  })
);

// Get group chat
router.get(
  '/group/:groupId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'username profilePicture email')
      .populate('expenseId', 'title amount')
      .populate('paymentId', 'amount from to')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .reverse();

    res.json({
      success: true,
      messages,
    });
  })
);

// Mark messages as read
router.post(
  '/mark-read/:groupId',
  authenticate,
  asyncHandler(async (req, res) => {
    await Message.updateMany(
      { group: req.params.groupId },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  })
);

// Delete message
router.delete(
  '/:messageId',
  authenticate,
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.deleteOne({ _id: req.params.messageId });

    res.json({
      success: true,
      message: 'Message deleted',
    });
  })
);

export default router;
