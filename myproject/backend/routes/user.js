import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profiles');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.userId}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Get user profile
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('-password');
    res.json({
      success: true,
      user,
    });
  })
);

// Update user profile
router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, username, phoneNumber, bio, preferences } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.bio = bio;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      user,
      message: 'Profile updated successfully',
    });
  })
);

// Upload profile picture
router.post(
  '/upload-picture',
  authenticate,
  upload.single('profilePicture'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.userId);
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      profilePicture: user.profilePicture,
      message: 'Profile picture uploaded',
    });
  })
);

// Update payment methods
router.post(
  '/payment-methods',
  authenticate,
  asyncHandler(async (req, res) => {
    const { type, details, isDefault } = req.body;

    const user = await User.findById(req.userId);
    const paymentMethod = {
      type,
      details,
      isDefault: isDefault || false,
    };

    if (isDefault) {
      user.paymentMethods.forEach((pm) => {
        pm.isDefault = false;
      });
    }

    user.paymentMethods.push(paymentMethod);
    await user.save();

    res.status(201).json({
      success: true,
      paymentMethods: user.paymentMethods,
      message: 'Payment method added',
    });
  })
);

// Get all users for search
router.get(
  '/search',
  authenticate,
  asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find(
      {
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
        ],
      },
      'email username firstName lastName profilePicture'
    ).limit(10);

    res.json({
      success: true,
      users,
    });
  })
);

export default router;
