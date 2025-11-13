import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'booking_request',
        'booking_accepted',
        'booking_rejected',
        'booking_completed',
        'company_response_needed',
        'payment_received',
        'feedback_request',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    // Additional fields for hire request notifications
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: {
      type: String,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
    },
    staffName: {
      type: String,
    },
    actionStatus: {
      type: String,
      enum: ['accepted', 'rejected'],
    },
    statusMessage: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ companyId: 1, createdAt: -1 });
notificationSchema.index({ companyId: 1, userId: 1, createdAt: -1 });

const notificationModel = mongoose.model('Notification', notificationSchema);

export default notificationModel;
