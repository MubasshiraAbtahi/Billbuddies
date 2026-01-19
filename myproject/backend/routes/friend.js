import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import { FriendRequest, Friendship } from '../models/Friend.js';

const router = express.Router();

// Search users by email, username, or phone number
router.get(
  '/search',
  authenticate,
  asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude self
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } },
            { phoneNumber: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    }).select('_id email username firstName lastName profilePicture phoneNumber');

    // Get friendship status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const isFriend = await Friendship.findOne({
          $or: [
            { user1: req.user._id, user2: user._id },
            { user1: user._id, user2: req.user._id },
          ],
          status: 'active',
        });

        const pendingRequest = await FriendRequest.findOne({
          $or: [
            { sender: req.user._id, recipient: user._id },
            { sender: user._id, recipient: req.user._id },
          ],
          status: 'pending',
        });

        return {
          ...user.toObject(),
          isFriend: !!isFriend,
          hasPendingRequest: !!pendingRequest,
          requestSentByMe: pendingRequest?.sender?.toString() === req.user._id.toString(),
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStatus,
    });
  })
);

// Send friend request
router.post(
  '/request/send',
  authenticate,
  asyncHandler(async (req, res) => {
    const { recipientId, recipientEmail, message } = req.body;

    let recipient;

    if (recipientId) {
      recipient = await User.findById(recipientId);
    } else if (recipientEmail) {
      recipient = await User.findOne({ email: recipientEmail });
    } else {
      return res.status(400).json({ message: 'Recipient ID or email is required' });
    }

    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if already friends
    const existing = await Friendship.findOne({
      $or: [
        { user1: req.user._id, user2: recipient._id },
        { user1: recipient._id, user2: req.user._id },
      ],
      status: 'active',
    });

    if (existing) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already sent
    const existingRequest = await FriendRequest.findOne({
      sender: req.user._id,
      recipient: recipient._id,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = new FriendRequest({
      sender: req.user._id,
      recipient: recipient._id,
      message,
    });

    await request.save();
    await request.populate('sender recipient', 'username email firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: request,
    });
  })
);

// Get friend requests
router.get(
  '/requests',
  authenticate,
  asyncHandler(async (req, res) => {
    const requests = await FriendRequest.find({
      recipient: req.user._id,
      status: 'pending',
    })
      .populate('sender', 'username email firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  })
);

// Accept friend request
router.post(
  '/request/accept/:requestId',
  authenticate,
  asyncHandler(async (req, res) => {
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    request.status = 'accepted';
    await request.save();

    // Create friendship
    const friendship = new Friendship({
      user1: request.sender,
      user2: request.recipient,
      status: 'active',
    });

    await friendship.save();

    res.json({
      success: true,
      message: 'Friend request accepted',
      data: friendship,
    });
  })
);

// Decline friend request
router.post(
  '/request/decline/:requestId',
  authenticate,
  asyncHandler(async (req, res) => {
    const request = await FriendRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    request.status = 'declined';
    await request.save();

    res.json({
      success: true,
      message: 'Friend request declined',
    });
  })
);

// Get friends list
router.get(
  '/list',
  authenticate,
  asyncHandler(async (req, res) => {
    const friendships = await Friendship.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
      status: 'active',
    }).populate('user1 user2', 'username email firstName lastName profilePicture');

    const friends = friendships.map((friendship) => {
      return friendship.user1._id.toString() === req.user._id.toString()
        ? friendship.user2
        : friendship.user1;
    });

    res.json({
      success: true,
      data: friends,
    });
  })
);

// Remove friend
router.post(
  '/remove/:friendId',
  authenticate,
  asyncHandler(async (req, res) => {
    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { user1: req.user._id, user2: req.params.friendId },
        { user1: req.params.friendId, user2: req.user._id },
      ],
      status: 'active',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    res.json({
      success: true,
      message: 'Friend removed successfully',
    });
  })
);

export default router;
