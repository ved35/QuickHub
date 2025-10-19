import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema(
  {
    weekly: {
      type: Object,
      default: {},
    },
    slots: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
  },
  { _id: false }
);

const StaffSchema = new mongoose.Schema(
  {
    // Staff contact/profile fields
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String },
    profilePicture: { type: String },
    gender: { type: String },
    dob: { type: Date },
    address: { type: String, trim: true },
    description: { type: String, trim: true },

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
    availability: { 
      type: mongoose.Schema.Types.Mixed, 
      default: () => ({}) 
    },
    // Availability fields for different employment types (optional)
    availableHours: {
      // For part-time staff only
      startTime: { type: String }, // e.g., "09:00"
      endTime: { type: String },   // e.g., "17:00"
      daysPerWeek: { type: Number, min: 1, max: 6 }
    },
    availableDays: {
      // For full-time staff only
      workingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
      startTime: { type: String }, // e.g., "09:00"
      endTime: { type: String }    // e.g., "18:00"
    },
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

// Pre-save middleware to validate availability fields based on employment type
StaffSchema.pre('save', function(next) {
  if (this.employmentType === 'full_time') {
    // For full-time staff, clear availableHours if it exists
    if (this.availableHours) {
      this.availableHours = undefined;
    }
  } else if (this.employmentType === 'part_time') {
    // For part-time staff, clear availableDays if it exists
    if (this.availableDays) {
      this.availableDays = undefined;
    }
  }
  next();
});

// use consistent model name
export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
