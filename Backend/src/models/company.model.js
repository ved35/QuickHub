import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String },
    email: { type: String },
    address: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Company ||
  mongoose.model('Company', CompanySchema);
