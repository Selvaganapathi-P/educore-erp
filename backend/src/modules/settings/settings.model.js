const mongoose = require('mongoose');

/* Per-school settings — one document per school */
const settingsSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, unique: true },

    academic: {
      currentAcademicYear: String,          // e.g. "2024-25"
      academicYearStart:   { type: Number, default: 4 }, // month (April)
      workingDays:         { type: [Number], default: [1,2,3,4,5] },
      schoolStartTime:     { type: String, default: '08:00' },
      schoolEndTime:       { type: String, default: '14:30' },
      periodsPerDay:       { type: Number, default: 8 },
      periodDuration:      { type: Number, default: 45 }, // minutes
    },

    attendance: {
      lateThreshold:   { type: Number, default: 15 }, // minutes after start
      minimumRequired: { type: Number, default: 75  }, // percentage
      autoAbsent:      { type: Boolean, default: true },
    },

    fees: {
      currency:        { type: String, default: 'INR' },
      lateFineEnabled: { type: Boolean, default: true },
      lateFineAmount:  { type: Number, default: 50 },
      lateFineAfterDays:{ type: Number, default: 5 },
      receiptPrefix:   { type: String, default: 'REC' },
      invoicePrefix:   { type: String, default: 'INV' },
    },

    notifications: {
      smsEnabled:      { type: Boolean, default: false },
      emailEnabled:    { type: Boolean, default: true  },
      whatsappEnabled: { type: Boolean, default: false },
      pushEnabled:     { type: Boolean, default: true  },
      smsProvider:     String,
      smsApiKey:       { type: String, select: false },
      whatsappApiKey:  { type: String, select: false },
    },

    integrations: {
      googleClientId:     { type: String, select: false },
      googleClientSecret: { type: String, select: false },
      razorpayKeyId:      { type: String, select: false },
      razorpayKeySecret:  { type: String, select: false },
      stripePublishable:  { type: String, select: false },
      stripeSecret:       { type: String, select: false },
      cloudinaryCloud:    String,
      cloudinaryApiKey:   { type: String, select: false },
    },

    library: {
      maxBooksPerStudent:   { type: Number, default: 3 },
      maxBorrowDays:        { type: Number, default: 14 },
      finePerDay:           { type: Number, default: 2  },
    },

    transport: {
      gpsEnabled:   { type: Boolean, default: false },
      gpsProvider:  String,
    },

    certificates: {
      signatureText:   { type: String, default: 'Principal' },
      schoolSeal:      String,
      principalSign:   String,
    },

    idCard: {
      template:      { type: String, default: 'default' },
      bgColor:       { type: String, default: '#2563EB'  },
      textColor:     { type: String, default: '#FFFFFF'  },
      showBloodGroup:{ type: Boolean, default: true },
      showPhoto:     { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = { Settings };
