import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema(
  {
    // allow staff to be either linked to a registered user OR be a company-created record
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // changed from required:true -> optional
      index: true,
    },

    // fallback contact/profile fields for staff created by company (no user account)
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String },
    profilePicture: { type: String },
    gender: { type: String },
    dob: { type: Date },

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

// use consistent model name
export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
