import mongoose from 'mongoose';

const BalanceSchema = new mongoose.Schema(
  {
    debtor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial'],
      default: 'pending',
    },
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
  },
  { timestamps: true }
);

const PaymentSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    method: {
      type: String,
      enum: ['venmo', 'paypal', 'bank', 'card', 'cash', 'manual'],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    description: String,
    transactionId: String,
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  },
  { timestamps: true }
);

export const Balance = mongoose.model('Balance', BalanceSchema);
export const Payment = mongoose.model('Payment', PaymentSchema);
