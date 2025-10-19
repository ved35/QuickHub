// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema(
//   {
//     referenceNo: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     serviceSeekerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     serviceProviderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'ServiceProvider',
//       required: false, // allow unassigned bookings
//       index: true,
//     },
//     serviceId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true,
//       index: true,
//     },

//     // explicit scheduling fields
//     startDateTime: { type: Date, required: true, index: true },
//     endDateTime: { type: Date },

//     // legacy/backwards compatibility
//     scheduledDate: { type: Date },
//     duration: { type: Number, min: 0 },

//     // pricing (defaults, computed elsewhere)
//     amount: { type: Number, default: 0 },
//     cgst: { type: Number, default: 0 },
//     sgst: { type: Number, default: 0 },
//     total: { type: Number, default: 0 },

//     status: {
//       type: String,
//       enum: [
//         'requested',
//         'accepted',
//         'waiting_company_response',
//         'assigned',
//         'in_progress',
//         'completed',
//         'cancelled',
//         'paid',
//       ],
//       default: 'requested',
//       index: true,
//     },

//     isCompanyBooking: {
//       type: Boolean,
//       default: false,
//     },

//     companyResponse: {
//       status: {
//         type: String,
//         enum: ['pending', 'accepted', 'rejected'],
//         default: 'pending',
//       },
//       respondedAt: {
//         type: Date,
//       },
//       assignedStaff: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'ServiceProvider',
//       },
//     },

//     // UI/display fields
//     role: { type: String }, // e.g. "Caretaker"
//     notes: { type: String },
//     specialRequirements: { type: String },

//     // Location & geo
//     location: {
//       address: { type: String },
//       city: { type: String },
//       state: { type: String },
//       pincode: { type: String },
//       coordinates: {
//         type: { type: String, enum: ['Point'], default: 'Point' },
//         coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
//       },
//     },

//     // history for audit
//     history: [
//       {
//         status: String,
//         by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//         at: { type: Date, default: Date.now },
//         note: String,
//       },
//     ],

//     meta: { type: mongoose.Schema.Types.Mixed },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Useful indexes
// bookingSchema.index({ serviceSeekerId: 1, startDateTime: -1 });
// bookingSchema.index({ serviceProviderId: 1, status: 1, startDateTime: -1 });
// bookingSchema.index({ referenceNo: 1 }, { unique: true });
// bookingSchema.index({ 'location.coordinates': '2dsphere' });

// const bookingModel =
//   mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// export default bookingModel;
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    referenceNo: { type: String, required: true, unique: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
    service: { type: String, required: true, index: true },
    employmentType: { type: String, enum: ['full_time', 'part_time', 'freelance'], required: true },
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
    status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'], default: 'Pending', index: true },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
    rating: { type: Number },
    review: { type: String },
    notes: { type: String },
    location: { address: String, city: String, state: String, pincode: String },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, startDate: -1 });
BookingSchema.index({ staffId: 1, status: 1, startDate: -1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

