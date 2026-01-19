import mongoose from 'mongoose';

const SplitTemplateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    splitMethod: {
      type: String,
      enum: ['equal', 'percentage', 'custom', 'itemized'],
      required: true,
    },
    splits: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        percentage: Number,
        amount: Number,
      },
    ],
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SplitTemplate', SplitTemplateSchema);
