import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get user notifications
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      notifications,
    });
  })
);

// Mark notification as read
router.put(
  '/:notificationId/read',
  authenticate,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  })
);

// Mark all as read
router.put(
  '/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { recipient: req.user._id },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  })
);

// Delete notification
router.delete(
  '/:notificationId',
  authenticate,
  asyncHandler(async (req, res) => {
    await Notification.findByIdAndDelete(req.params.notificationId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  })
);

export default router;
