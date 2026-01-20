import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import multer from 'multer';
import path from 'path';
import { scanReceiptOCR, analyzeReceiptQuality } from '../utils/ocrScanner.js';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/receipts');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Scan receipt and extract data
router.post(
  '/scan',
  authenticate,
  upload.single('receipt'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Analyze image quality
      const qualityAnalysis = analyzeReceiptQuality(req.file.path);

      // Scan receipt using OCR
      const ocrResult = await scanReceiptOCR(req.file.path);

      if (!ocrResult.success) {
        return res.status(400).json({
          message: ocrResult.message,
          qualityScore: qualityAnalysis.qualityScore,
        });
      }

      // Combine results
      const scannedData = {
        ...ocrResult.data,
        imagePath: req.file.path,
        imageUrl: `/uploads/receipts/${req.file.filename}`,
        qualityScore: qualityAnalysis.qualityScore,
        rawOCRText: ocrResult.rawOCRText,
      };

      res.json({
        success: true,
        data: scannedData,
        message: 'Receipt scanned successfully',
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error scanning receipt',
        error: error.message,
      });
    }
  })
);

// Verify and create expense from scanned receipt
router.post(
  '/create-expense',
  authenticate,
  asyncHandler(async (req, res) => {
    const {
      groupId,
      title,
      amount,
      currency,
      category,
      items,
      tax,
      tip,
      merchant,
      date,
      imagePath,
      splits,
    } = req.body;

    // Validate group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is group member
    const isMember = group.members.some(
      (member) => member.userId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Create expense
    const expense = new Expense({
      title,
      amount,
      currency,
      category,
      payer: req.user._id,
      group: groupId,
      splitMethod: 'itemized',
      itemizedList: items,
      tax,
      tip,
      receiptImage: imagePath,
      receiptData: {
        merchant,
        date: new Date(date),
      },
      splits: splits || [],
    });

    await expense.save();

    // Update group stats
    group.totalExpenses += 1;
    group.totalSpent += amount;
    await group.save();

    res.status(201).json({
      success: true,
      expense,
      message: 'Expense created from scanned receipt',
    });
  })
);

// Manual receipt editing endpoint
router.post(
  '/verify-data',
  authenticate,
  asyncHandler(async (req, res) => {
    const { scannedData, corrections } = req.body;

    // Merge corrections with scanned data
    const verifiedData = {
      ...scannedData,
      items: corrections.items || scannedData.items,
      merchant: corrections.merchant || scannedData.merchant,
      total: corrections.total || scannedData.total,
      tax: corrections.tax || scannedData.tax,
      tip: corrections.tip || scannedData.tip,
    };

    res.json({
      success: true,
      data: verifiedData,
      message: 'Receipt data verified',
    });
  })
);

export default router;
