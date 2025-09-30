import mongoose from 'mongoose';

const forgotPasswordAdminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    // OTP stored in plain for quick verification; recommend hashing for production
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    // Optional reset token (hashed) for token-based resets
    resetTokenHash: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

forgotPasswordAdminSchema.index({ username: 1, createdAt: -1 });

const ForgotPasswordAdmin = mongoose.model('ForgotPasswordAdmin', forgotPasswordAdminSchema);

export default ForgotPasswordAdmin;
