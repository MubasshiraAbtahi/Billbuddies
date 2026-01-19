import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'expense_added',
        'friend_request',
        'payment_received',
        'debt_settled',
        'payment_reminder',
        'group_invitation',
        'expense_comment',
        'friend_request_accepted',
      ],
      required: true,
    },
    title: String,
    message: String,
    data: mongoose.Schema.Types.Mixed,
    isRead: {
      type: Boolean,
      default: false,
    },
    expireAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
