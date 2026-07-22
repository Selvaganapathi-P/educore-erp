const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    slug:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      country: { type: String, default: 'India' },
      pincode: { type: String, default: '' },
    },
    logo:    String,
    website: String,
    board:   String,
    type: {
      type: String,
      enum: ['primary', 'secondary', 'higher_secondary', 'k12', 'university'],
      default: 'k12',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'trial'],
      default: 'trial',
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'standard', 'premium', 'enterprise'],
      default: 'free',
    },
    subscriptionExpiry: Date,
    trialExpiry: Date,
    trialEndDate: Date,
    statusReason: String,
    suspendedAt:  Date,
    settings: {
      academicYearStart: { type: Number, default: 4 },
      timezone:   { type: String, default: 'Asia/Kolkata' },
      currency:   { type: String, default: 'INR' },
      language:   { type: String, default: 'en' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    },
    branding: {
      primaryColor:   { type: String, default: '#2563EB' },
      secondaryColor: { type: String, default: '#64748B' },
      favicon:        String,
      customDomain:   String,
    },
    storageUsed:  { type: Number, default: 0 },
    storageLimit: { type: Number, default: 5368709120 },
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  Date,
  },
  { timestamps: true }
);

schoolSchema.index({ slug: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ isDeleted: 1 });

const School = mongoose.model('School', schoolSchema);
module.exports = { School };
