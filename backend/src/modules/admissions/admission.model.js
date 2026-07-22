const mongoose = require('mongoose');

const ADMISSION_STATUSES = [
  'enquiry', 'applied', 'documents_pending', 'under_review',
  'interview_scheduled', 'approved', 'waitlisted', 'enrolled', 'rejected',
];

const admissionSchema = new mongoose.Schema(
  {
    schoolId:      { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    applicationNo: { type: String, unique: true },

    // Applicant
    student: {
      firstName:    { type: String, required: true, trim: true },
      lastName:     { type: String, required: true, trim: true },
      dateOfBirth:  { type: Date, required: true },
      gender:       { type: String, enum: ['male','female','other'], required: true },
      bloodGroup:   String,
      nationality:  { type: String, default: 'Indian' },
      religion:     String,
      category:     { type: String, enum: ['general','obc','sc','st','ews','other'], default: 'general' },
      motherTongue: String,
      photo:        String,
      aadhaarNo:    { type: String, select: false },
    },

    // Class applying for
    applyingForClass: { type: String, required: true },
    applyingForYear:  { type: String, required: true },
    previousSchool: {
      name:     String,
      class:    String,
      board:    String,
      percentage: Number,
      tcNumber: String,
    },

    // Primary guardian
    father: {
      name:        String,
      phone:       String,
      email:       String,
      occupation:  String,
      qualification:String,
      income:      Number,
    },
    mother: {
      name:        String,
      phone:       String,
      email:       String,
      occupation:  String,
      qualification:String,
    },
    guardian: {
      name:         String,
      phone:        String,
      email:        String,
      relationship: String,
    },

    // Address
    address: {
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    // Pipeline
    status: { type: String, enum: ADMISSION_STATUSES, default: 'enquiry', index: true },
    statusHistory: [{
      status:    { type: String, enum: ADMISSION_STATUSES },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      note:      String,
      changedAt: { type: Date, default: Date.now },
    }],

    // Interview
    interviewDate:   Date,
    interviewNote:   String,
    interviewScore:  Number,

    // Documents
    documents: [{
      type:       { type: String }, // birth_certificate, marksheet, photo, address_proof, tc, aadhaar
      name:       String,
      url:        String,
      uploadedAt: { type: Date, default: Date.now },
      verified:   { type: Boolean, default: false },
    }],
    documentsRequired: [String],

    // Review
    reviewNote:    String,
    reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt:    Date,

    // Approval / rejection
    approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt:    Date,
    rejectionReason: String,

    // Enrollment — links to created student user
    enrolledStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledAt:        Date,
    admissionFee:      { type: Number, default: 0 },
    feePaid:           { type: Boolean, default: false },

    // Waitlist
    waitlistPosition: Number,

    // Source
    source:   { type: String, enum: ['walk_in','online','referral','campaign','other'], default: 'online' },
    referredBy: String,
    notes:    String,

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Auto-generate applicationNo before save
admissionSchema.pre('save', async function (next) {
  if (!this.applicationNo) {
    const count = await mongoose.model('Admission').countDocuments({ schoolId: this.schoolId });
    const year  = new Date().getFullYear().toString().slice(-2);
    this.applicationNo = `ADM${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

admissionSchema.index({ schoolId: 1, status: 1 });
admissionSchema.index({ schoolId: 1, createdAt: -1 });
admissionSchema.index({ 'student.firstName': 1, 'student.lastName': 1 });

const Admission = mongoose.model('Admission', admissionSchema);
module.exports = { Admission, ADMISSION_STATUSES };
