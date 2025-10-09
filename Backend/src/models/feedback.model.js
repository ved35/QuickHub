import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
      index: true,
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

FeedbackSchema.index({ providerId: 1, createdAt: -1 });

export default mongoose.models.Feedback ||
  mongoose.model('Feedback', FeedbackSchema);
