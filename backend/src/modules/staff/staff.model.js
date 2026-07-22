const mongoose = require('mongoose');

const staffProfileSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

    employeeId:     { type: String },
    department:     { type: String, required: true },
    designation:    { type: String, required: true },
    reportingTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    joiningDate:    { type: Date, required: true },
    confirmationDate: Date,
    employmentType: { type: String, enum: ['permanent','contractual','part_time','visiting','probation'], default: 'permanent' },
    subjects:       [String],  // for teachers
    classes:        [String],  // classes assigned

    // Salary
    salary: {
      basic:        { type: Number, default: 0, select: false },
      hra:          { type: Number, default: 0, select: false },
      da:           { type: Number, default: 0, select: false },
      ta:           { type: Number, default: 0, select: false },
      medical:      { type: Number, default: 0, select: false },
      other:        { type: Number, default: 0, select: false },
      deductions:   { type: Number, default: 0, select: false },
      pf:           { type: Number, default: 0, select: false },
      esi:          { type: Number, default: 0, select: false },
      grade:        String, // pay grade label only
    },

    // Qualifications
    qualifications: [{
      degree:      String,
      subject:     String,
      institution: String,
      year:        Number,
      percentage:  Number,
      grade:       String,
    }],

    // Work experience
    experience: [{
      title:        String,
      organization: String,
      from:         Date,
      to:           Date,
      isCurrent:    { type: Boolean, default: false },
      description:  String,
    }],

    // Emergency contact
    emergencyContact: {
      name:         String,
      relationship: String,
      phone:        String,
    },

    // Bank details (sensitive)
    bankDetails: {
      accountNo:  { type: String, select: false },
      ifscCode:   { type: String, select: false },
      bankName:   { type: String, select: false },
      branch:     { type: String, select: false },
      panNo:      { type: String, select: false },
      pfNo:       String,
      esiNo:      String,
    },

    // Documents
    documents: [{
      type:       String,  // resume, degree, aadhaar, pan, experience_letter
      name:       String,
      url:        String,
      verified:   { type: Boolean, default: false },
      uploadedAt: { type: Date, default: Date.now },
    }],

    // Leave balance (reset annually)
    leaveBalance: {
      casual:     { type: Number, default: 12 },
      sick:       { type: Number, default: 7  },
      earned:     { type: Number, default: 15 },
      maternity:  { type: Number, default: 0  },
      lop:        { type: Number, default: 0  },  // loss of pay taken
    },

    biometricId: String,
    rfidCard:    String,

    status:          { type: String, enum: ['active','on_leave','suspended','relieved','retired'], default: 'active' },
    relievingDate:   Date,
    relievingReason: String,
    noticePeriodEnd: Date,

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Auto employee ID
staffProfileSchema.pre('save', async function (next) {
  if (!this.employeeId && this.isNew) {
    const count = await mongoose.model('StaffProfile').countDocuments({ schoolId: this.schoolId });
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

staffProfileSchema.index({ schoolId: 1, department: 1 });
staffProfileSchema.index({ userId: 1 });
staffProfileSchema.index({ employeeId: 1, schoolId: 1 });

const StaffProfile = mongoose.model('StaffProfile', staffProfileSchema);
module.exports = { StaffProfile };
