const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { USER_ROLES } = require('../roles/role.model');

const userSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null, index: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false, minlength: 8 },
    role:     { type: String, required: true, enum: USER_ROLES },

    profile: {
      firstName:   { type: String, required: true, trim: true },
      lastName:    { type: String, required: true, trim: true },
      avatar:      String,
      phone:       String,
      gender:      { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
      dateOfBirth: Date,
      bloodGroup:  { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      address:     String,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'pending',
    },

    isEmailVerified:        { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpiry:{ type: Date,   select: false },
    passwordResetToken:     { type: String, select: false },
    passwordResetExpiry:    { type: Date,   select: false },
    otpCode:    { type: String, select: false },
    otpExpiry:  { type: Date,   select: false },
    refreshTokens: { type: [String], select: false, default: [] },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret:  { type: String, select: false },

    lastLogin:     Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil:     Date,

    devices: [{
      deviceId:   String,
      deviceName: String,
      ip:         String,
      userAgent:  String,
      lastSeen:   { type: Date, default: Date.now },
    }],

    preferences: {
      language: { type: String, default: 'en' },
      theme:    { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: {
        email:    { type: Boolean, default: true },
        sms:      { type: Boolean, default: true },
        push:     { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false },
      },
    },

    isDeleted:  { type: Boolean, default: false },
    deletedAt:  Date,
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ schoolId: 1, status: 1 });
userSchema.index({ isDeleted: 1 });

const User = mongoose.model('User', userSchema);
module.exports = { User };
