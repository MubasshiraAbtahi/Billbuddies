import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    groupIcon: String,
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    defaultSplitMethod: {
      type: String,
      enum: ['equal', 'percentage', 'custom', 'itemized'],
      default: 'equal',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Group', GroupSchema);
