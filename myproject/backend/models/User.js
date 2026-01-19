import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    phoneNumber: String,
    firstName: String,
    lastName: String,
    profilePicture: String,
    bio: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ['venmo', 'paypal', 'bank', 'card'],
        },
        details: mongoose.Schema.Types.Mixed,
        isDefault: Boolean,
      },
    ],
    preferences: {
      currency: {
        type: String,
        default: 'USD',
      },
      defaultSplitMethod: {
        type: String,
        enum: ['equal', 'percentage', 'custom', 'itemized'],
        default: 'equal',
      },
      language: {
        type: String,
        default: 'en',
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
    },
    badges: [
      {
        name: String,
        earnedAt: Date,
      },
    ],
    debtFreeStreak: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
