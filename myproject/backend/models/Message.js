import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    text: String,
    type: {
      type: String,
      enum: ['text', 'expense', 'payment', 'system'],
      default: 'text',
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
