const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    price:       { type: Number, required: true },
    currency:    { type: String, default: 'INR' },
    billingCycle:{ type: String, enum: ['monthly','annually'], default: 'monthly' },
    features:    [String],
    limits: {
      students:   { type: Number, default: 500   },
      teachers:   { type: Number, default: 50    },
      storage:    { type: Number, default: 5368709120 }, // 5 GB
      modules:    [String],
    },
    isActive: { type: Boolean, default: true },
    trialDays:{ type: Number, default: 14   },
  },
  { timestamps: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    schoolId:    { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    plan:        { type: String, required: true },
    status:      { type: String, enum: ['active','cancelled','expired','trial','past_due'], default: 'trial' },
    startDate:   { type: Date, required: true, default: Date.now },
    endDate:     { type: Date, required: true },
    trialEndDate:{ type: Date },
    amount:      { type: Number, default: 0 },
    currency:    { type: String, default: 'INR' },
    paymentMethod: String,
    transactionId: String,
    invoices: [{
      invoiceNo:   String,
      amount:      Number,
      status:      { type: String, enum: ['paid','pending','failed'], default: 'pending' },
      paidAt:      Date,
      dueDate:     Date,
      downloadUrl: String,
    }],
    cancelledAt: Date,
    cancelReason:String,
    renewedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  },
  { timestamps: true }
);

subscriptionSchema.index({ schoolId: 1, status: 1 });

const Plan         = mongoose.model('Plan',         planSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = { Plan, Subscription };
