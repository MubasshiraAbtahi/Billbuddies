import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    category: {
      type: String,
      enum: ['Food', 'Rent', 'Travel', 'Entertainment', 'Utilities', 'Other'],
      default: 'Other',
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    splitMethod: {
      type: String,
      enum: ['equal', 'percentage', 'custom', 'itemized'],
      default: 'equal',
    },
    splits: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: Number,
        percentage: Number,
        items: [
          {
            name: String,
            price: Number,
          },
        ],
      },
    ],
    itemizedList: [
      {
        name: String,
        price: Number,
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    tax: {
      amount: Number,
      splitMethod: {
        type: String,
        enum: ['equal', 'proportional'],
        default: 'proportional',
      },
    },
    tip: {
      amount: Number,
      splitMethod: {
        type: String,
        enum: ['equal', 'proportional'],
        default: 'proportional',
      },
    },
    receiptImage: String,
    receiptData: {
      merchant: String,
      date: Date,
      ocrConfidence: Number,
      rawOCRText: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    attachments: [String],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDisputed: Boolean,
    editHistory: [
      {
        editedAt: Date,
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changes: mongoose.Schema.Types.Mixed,
      },
    ],
    isRecurring: Boolean,
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'],
      },
      endDate: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', ExpenseSchema);
