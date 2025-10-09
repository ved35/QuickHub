import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },
    hourlyRate: { type: Number },
    dailyRate: { type: Number },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'freelance'],
      default: 'full_time',
    },
    specializations: [{ type: String, index: true }], // service names or ids
    bio: { type: String },
    experienceYears: { type: Number, default: 0 },
    availability: { type: AvailabilitySchema, default: () => ({}) },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    documents: [{ name: String, url: String, verified: Boolean }],
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

StaffSchema.index({ companyId: 1, employmentType: 1 });
StaffSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.models.staffModel ||
  mongoose.model('StaffModel', StaffSchema);
