import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    referenceNo: { type: String, required: true, unique: true, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
      index: true,
    },
    service: { type: String, required: true, index: true },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'freelance'],
      required: true,
    },
    shiftHoursPerDay: { type: Number },
    timeWindowPerDay: { type: String },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    feeSnapshot: {
      hourlyRate: { type: Number },
      dailyRate: { type: Number },
      amount: { type: Number, default: 0 },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid'],
      default: 'Unpaid',
    },
    transactionId: { type: String, default: null },
    rating: { type: Number },
    review: { type: String },
    notes: { type: String },
    location: { address: String, city: String, state: String, pincode: String },
    rejectionReason: { type: String },
    rejectedAt: { type: Date },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, startDate: -1 });
BookingSchema.index({ staffId: 1, status: 1, startDate: -1 });

export default mongoose.models.Booking ||
  mongoose.model('Booking', BookingSchema);
